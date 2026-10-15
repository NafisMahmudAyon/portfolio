import { GoogleGenAI } from '@google/genai';
import { connectDB } from '@/lib/db';
import FacebookMessage from '@/models/FacebookMessage';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://nafisbd.com').replace(/\/$/, '');

export interface FacebookMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: {
    mid: string;
    text?: string;
    is_echo?: boolean;
    attachments?: Array<{
      type: 'image' | 'audio' | 'video' | 'file' | string;
      payload?: {
        url?: string;
      };
    }>;
  };
  postback?: {
    payload: string;
    title: string;
  };
}

/**
 * Converts standard Markdown bold (**bold**) into Unicode bold characters
 * so Facebook Messenger displays formatted bold text on mobile & desktop.
 */
export function formatMessengerBold(text: string): string {
  const upperOffset = 0x1d400 - 0x41; // A → 𝐀
  const lowerOffset = 0x1d41a - 0x61; // a → 𝐚
  const digitOffset = 0x1d7ce - 0x30; // 0 → 𝟎

  const toUnicode = (str: string) => {
    return str
      .split('')
      .map((ch) => {
        const code = ch.charCodeAt(0);
        if (code >= 0x41 && code <= 0x5a) return String.fromCodePoint(code + upperOffset);
        if (code >= 0x61 && code <= 0x7a) return String.fromCodePoint(code + lowerOffset);
        if (code >= 0x30 && code <= 0x39) return String.fromCodePoint(code + digitOffset);
        return ch;
      })
      .join('');
  };

  return text
    .replace(/\*{1,2}([^*]+?)\*{1,2}/g, (_, boldContent) => toUnicode(boldContent))
    .replace(/\*/g, '');
}

/**
 * Downloads media (image or audio) from Facebook's CDN URL and converts to base64
 */
async function downloadMediaAsBase64(
  url: string,
  pageAccessToken?: string
): Promise<{ base64: string; mimeType: string }> {
  let res = await fetch(url, {
    headers: pageAccessToken ? { Authorization: `Bearer ${pageAccessToken}` } : {},
  });

  if (!res.ok) {
    // Try without auth header if CDN is signed directly
    res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to download media: ${res.status} ${res.statusText}`);
    }
  }

  const contentType = res.headers.get('content-type') || 'application/octet-stream';
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return {
    base64: buffer.toString('base64'),
    mimeType: contentType.split(';')[0].trim(),
  };
}

/**
 * Sends a message reply back to the user via Facebook Graph API v21.0
 */
export async function sendFacebookMessengerReply(
  recipientPsid: string,
  messageText: string,
  pageAccessToken: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = 'https://graph.facebook.com/v21.0/me/messages';

  try {
    const formattedText = formatMessengerBold(messageText);

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: recipientPsid },
        messaging_type: 'RESPONSE',
        message: { text: formattedText },
        access_token: pageAccessToken,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const errMsg = data.error?.message || JSON.stringify(data);
      console.error('[Facebook Messenger] Graph API send error:', errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true, messageId: data.message_id || data.id };
  } catch (err: any) {
    console.error('[Facebook Messenger] Exception sending reply:', err);
    return { success: false, error: err?.message || 'Network error' };
  }
}

/**
 * Main Messenger Handler — processes text, audio, or image through Google Gemini
 * with multi-turn conversation memory from MongoDB.
 */
export async function handleIncomingFacebookMessage(
  event: FacebookMessagingEvent
): Promise<{ processed: boolean; reason: string }> {
  const FB_PAGE_ID = process.env.FB_PAGE_ID;
  const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.APIKEY;

  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
    console.warn('[Facebook Messenger] Missing Facebook credentials in environment');
    return { processed: false, reason: 'Missing Facebook credentials' };
  }

  if (!geminiApiKey) {
    console.warn('[Facebook Messenger] Missing GEMINI_API_KEY');
    return { processed: false, reason: 'Missing GEMINI_API_KEY' };
  }

  const senderId = event.sender?.id;
  if (!senderId) {
    return { processed: false, reason: 'Missing sender ID' };
  }

  // Prevent bot replying to itself
  if (senderId === FB_PAGE_ID || event.message?.is_echo) {
    return { processed: false, reason: 'Ignored echo/page self-message' };
  }

  const incomingMsg = event.message;
  const postback = event.postback;

  let messageType: 'text' | 'image' | 'audio' | 'unknown' = 'text';
  let userText = incomingMsg?.text || postback?.title || postback?.payload || '';
  let mediaUrl: string | null = null;
  let mediaBase64: string | null = null;
  let mediaMimeType: string | null = null;

  // 1. Detect media attachments
  if (incomingMsg?.attachments && incomingMsg.attachments.length > 0) {
    const attachment = incomingMsg.attachments[0];
    mediaUrl = attachment.payload?.url || null;

    if (attachment.type === 'image' && mediaUrl) {
      messageType = 'image';
      try {
        const media = await downloadMediaAsBase64(mediaUrl, FB_PAGE_ACCESS_TOKEN);
        mediaBase64 = media.base64;
        mediaMimeType = media.mimeType || 'image/jpeg';
      } catch (err: any) {
        console.warn('[Facebook Messenger] Error downloading image:', err?.message);
      }
    } else if (attachment.type === 'audio' && mediaUrl) {
      messageType = 'audio';
      try {
        const media = await downloadMediaAsBase64(mediaUrl, FB_PAGE_ACCESS_TOKEN);
        mediaBase64 = media.base64;
        mediaMimeType = media.mimeType || 'audio/mp4';
      } catch (err: any) {
        console.warn('[Facebook Messenger] Error downloading audio:', err?.message);
      }
    }
  }

  if (!userText && !mediaBase64) {
    return { processed: false, reason: 'Ignored empty or unsupported event' };
  }

  await connectDB();

  // 2. Load conversation history from MongoDB (last 6 turns for this PSID)
  let historyParts: any[] = [];
  try {
    const recent = await FacebookMessage.find({ psid: senderId, status: 'sent' })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();

    // Reverse to chronological order (oldest to newest)
    recent.reverse();

    // Filter out fallback generic replies
    const validRecent = (recent as any[]).filter(
      (m) => m.aiReply && !m.aiReply.includes('will get back to you shortly')
    );

    for (const msg of validRecent) {
      if (msg.userMessage && msg.aiReply) {
        historyParts.push({
          role: 'user',
          parts: [{ text: msg.userMessage }],
        });
        historyParts.push({
          role: 'model',
          parts: [{ text: msg.aiReply }],
        });
      }
    }
  } catch (err) {
    console.warn('[Facebook Messenger] Error loading history from DB:', err);
  }

  // 3. Build current turn contents for Gemini
  const currentParts: any[] = [];

  if (messageType === 'image' && mediaBase64) {
    currentParts.push({
      inlineData: {
        mimeType: mediaMimeType || 'image/jpeg',
        data: mediaBase64,
      },
    });
    const prompt = userText
      ? `The user sent this photo with the message: "${userText}". Analyze the photo and answer their question clearly.`
      : 'The user sent this photo. Describe what you see and highlight any key details, text, or questions in it.';
    currentParts.push({ text: prompt });
  } else if (messageType === 'audio' && mediaBase64) {
    currentParts.push({
      inlineData: {
        mimeType: mediaMimeType || 'audio/mp4',
        data: mediaBase64,
      },
    });
    currentParts.push({
      text: 'Listen to this voice message from the user. Transcribe what they said in their original language, and provide a direct, helpful, and friendly answer to their query.',
    });
  } else {
    currentParts.push({ text: userText });
  }

  const systemInstruction = `
You are the official AI Assistant for Nafis Mahmud Ayon (NafisBD) on Facebook Messenger.
Nafis is a skilled Frontend & Full-Stack Developer, creator of Aspect UI, tech writer, and builder of modern web applications.
Portfolio & Blog: ${APP_URL}

GUIDELINES:
1. Be warm, professional, friendly, and helpful.
2. Language: Always respond in the EXACT language used by the user (multilingual: English, Bengali, French, Spanish, Hindi, etc.).
3. If asked about Nafis's skills, background, or blog posts, highlight his modern web expertise (React 19, Next.js 15, TypeScript, Tailwind, MongoDB) and invite them to explore his portfolio (${APP_URL}).
4. If the user asks for calculations, factual questions, or tech advice, provide accurate, concise answers.
5. Formatting: Keep responses conversational and easy to read on mobile Messenger. Use bullet points and line breaks. Avoid massive text walls.
`;

  const withTimeout = <T>(promise: Promise<T>, ms: number, timeoutMsg: string): Promise<T> => {
    let timer: NodeJS.Timeout;
    return Promise.race([
      promise.finally(() => clearTimeout(timer)),
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(timeoutMsg)), ms);
      }),
    ]);
  };

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const preferredModel =
    process.env.GEMINI_REPLY_MODEL && !process.env.GEMINI_REPLY_MODEL.includes('gemma')
      ? process.env.GEMINI_REPLY_MODEL
      : 'gemini-2.5-flash-lite';

  const modelsToTry = Array.from(
    new Set([
      preferredModel,
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
    ])
  );

  let aiReply = '';
  let modelUsed = preferredModel;

  for (const model of modelsToTry) {
    try {
      console.log(`[Facebook Messenger] Generating reply using model: ${model}`);
      const callPromise = ai.models.generateContent({
        model,
        contents: [...historyParts, { role: 'user', parts: currentParts }],
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const response = await withTimeout(callPromise, 10000, `Model ${model} timed out after 10s`);
      const text = response.text?.trim();
      if (text) {
        aiReply = text;
        modelUsed = model;
        break;
      }
    } catch (modelErr: any) {
      console.warn(`[Facebook Messenger] Model ${model} failed, trying next:`, modelErr?.message || modelErr);
    }
  }

  if (!aiReply) {
    aiReply = "Hi! Thanks for reaching out to Nafis Mahmud Ayon. Feel free to explore my latest projects, tutorials, and open-source tools at https://nafisbd.com.";
  }

  // 4. Send response via Facebook Graph API
  const sendResult = await sendFacebookMessengerReply(senderId, aiReply, FB_PAGE_ACCESS_TOKEN);

  // 5. Save to MongoDB
  try {
    await FacebookMessage.create({
      psid: senderId,
      messageType,
      userMessage: userText || (messageType === 'image' ? '[Photo sent]' : '[Voice message sent]'),
      mediaUrl,
      aiReply,
      model: modelUsed,
      status: sendResult.success ? 'sent' : 'failed',
      error: sendResult.error || null,
    });
  } catch (dbErr) {
    console.warn('[Facebook Messenger] Error saving message to MongoDB:', dbErr);
  }

  return {
    processed: true,
    reason: `Replied via ${modelUsed} (Send status: ${sendResult.success ? 'success' : 'failed'})`,
  };
}
