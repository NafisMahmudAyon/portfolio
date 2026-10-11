import { GoogleGenAI } from '@google/genai';
import { connectDB } from '@/lib/db';
import FacebookCommentReply from '@/models/FacebookCommentReply';
import BlogPost from '@/models/BlogPost';
import SocialPost from '@/models/SocialPost';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://nafisbd.com').replace(/\/$/, '');
const REPLY_MODEL = process.env.GEMINI_REPLY_MODEL || 'gemma-4-31b-it';
const FALLBACK_MODEL = 'gemini-3.8-flash';

export interface FacebookCommentEventValue {
  item: string;
  verb: string;
  comment_id: string;
  post_id: string;
  parent_id?: string;
  created_time?: number;
  message?: string;
  from?: {
    id: string;
    name: string;
  };
}

export interface PostContextResult {
  contextText: string;
  blogPostId: any | null;
  blogPostSlug: string | null;
  blogPostTitle: string | null;
  blogPostUrl: string | null;
}

/**
 * Sends a public comment reply to a Facebook comment
 */
export async function sendFacebookCommentReply(
  commentId: string,
  messageText: string,
  pageAccessToken: string
): Promise<{ success: boolean; replyId?: string; error?: string }> {
  const url = `https://graph.facebook.com/v21.0/${commentId}/comments`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        message: messageText,
        access_token: pageAccessToken,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const errMsg = data.error?.message || JSON.stringify(data);
      console.error('[Facebook AutoReply] Public Comment Reply Error:', errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true, replyId: data.id };
  } catch (err: any) {
    console.error('[Facebook AutoReply] Public Comment Reply Exception:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Sends a private direct message (DM) in response to a public comment
 * Uses Meta's Graph API Private Replies endpoint: POST /{comment-id}/private_replies
 */
export async function sendFacebookPrivateReply(
  commentId: string,
  messageText: string,
  pageAccessToken: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const url = `https://graph.facebook.com/v21.0/${commentId}/private_replies`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        message: messageText,
        access_token: pageAccessToken,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) {
      const errMsg = data.error?.message || JSON.stringify(data);
      console.error('[Facebook AutoReply] Private Reply Error:', errMsg);
      return { success: false, error: errMsg };
    }

    return { success: true, messageId: data.id };
  } catch (err: any) {
    console.error('[Facebook AutoReply] Private Reply Exception:', err);
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Resolves context for the parent post from MongoDB and Facebook Graph API
 */
export async function getFacebookPostContext(
  postId: string,
  pageAccessToken: string
): Promise<PostContextResult> {
  let contextParts: string[] = [];
  let matchedBlogId: any = null;
  let matchedSlug: string | null = null;
  let matchedTitle: string | null = null;
  let matchedUrl: string | null = null;

  const cleanPostId = postId.includes('_') ? postId.split('_')[1] : postId;

  try {
    await connectDB();

    // 1. Search BlogPost collection directly by facebookPostId
    const blog = (await BlogPost.findOne({
      $or: [
        { facebookPostId: postId },
        { facebookPostId: cleanPostId },
        { facebookPostId: `${process.env.FB_PAGE_ID}_${cleanPostId}` },
      ],
    }).lean()) as any;

    if (blog) {
      matchedBlogId = blog._id;
      matchedSlug = blog.slug;
      matchedTitle = blog.title;
      matchedUrl = `${APP_URL}/blog/${blog.slug}`;

      contextParts.push(`Article Title: "${blog.title}"`);
      if (blog.excerpt) contextParts.push(`Excerpt: "${blog.excerpt}"`);
      if (blog.category) contextParts.push(`Category: "${blog.category}"`);
      contextParts.push(`Article URL: ${matchedUrl}`);
    }

    // 2. Search SocialPost collection as backup
    if (!matchedBlogId) {
      const socialPost = (await SocialPost.findOne({
        $or: [{ externalPostId: postId }, { externalPostId: cleanPostId }],
      })
        .populate('blogPostId')
        .lean()) as any;

      if (socialPost) {
        if (socialPost.caption) contextParts.push(`Post Caption: "${socialPost.caption}"`);
        const linkedBlog = socialPost.blogPostId;
        if (linkedBlog) {
          matchedBlogId = linkedBlog._id;
          matchedSlug = linkedBlog.slug;
          matchedTitle = linkedBlog.title;
          matchedUrl = `${APP_URL}/blog/${linkedBlog.slug}`;
          contextParts.push(`Article URL: ${matchedUrl}`);
        }
      }
    }

    // 3. Fallback: Query Facebook Graph API for post message
    if (contextParts.length === 0) {
      try {
        const fbRes = await fetch(
          `https://graph.facebook.com/v21.0/${postId}?fields=message,story&access_token=${pageAccessToken}`
        );
        const fbData = await fbRes.json();
        if (fbData.message) {
          contextParts.push(`Post Content: "${fbData.message}"`);
        }
      } catch (fbErr) {
        console.warn('[Facebook AutoReply] Graph API post lookup warning:', fbErr);
      }
    }
  } catch (err) {
    console.warn('[Facebook AutoReply] Error resolving post context:', err);
  }

  const contextText =
    contextParts.length > 0
      ? contextParts.join('\n')
      : `Tech article and software engineering post on Nafis Mahmud Ayon's portfolio (${APP_URL}).`;

  return {
    contextText,
    blogPostId: matchedBlogId,
    blogPostSlug: matchedSlug,
    blogPostTitle: matchedTitle,
    blogPostUrl: matchedUrl,
  };
}

/**
 * Generates both a Public Comment Reply and a Private Direct Message
 * using Gemini model "gemma-4-31b-it" (with automatic fallback to gemini-3.8-flash)
 */
export async function generateAiReplies(
  userComment: string,
  commenterName?: string,
  postContext?: PostContextResult
): Promise<{ publicReply: string; privateMessage: string }> {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.APIKEY;
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  const firstName = commenterName?.split(' ')[0] || 'there';
  const targetUrl = postContext?.blogPostUrl || `${APP_URL}/blog`;
  const postTitle = postContext?.blogPostTitle || 'this tech article';

  const prompt = `
You are Nafis Mahmud Ayon (NafisBD), a friendly, highly skilled Frontend & Full-Stack Developer and creator of Aspect UI.
A user named "${commenterName || 'Visitor'}" commented on your Facebook post.

POST CONTEXT:
${postContext?.contextText || 'Tech article and software development insights.'}

USER COMMENT:
"${userComment}"

TASK:
Generate TWO distinct, high-quality responses:
1. "publicReply": A concise, polite, engaging public comment reply (1-2 sentences). 
   - Acknowledge their comment warmly.
   - Mention that you sent them a private message with the link & helpful details so they can check their Messenger inbox.
   - Do NOT include full URLs in the public reply (keep public comments clean; links go in the private message).
2. "privateMessage": An informative, professional private direct message (Private Reply).
   - Greet them warmly by first name: "Hi ${firstName}! 👋"
   - Provide a direct helpful answer or appreciation.
   - Provide the direct article link: ${targetUrl}
   - Add a brief encouragement to check out more tutorials or connect at ${APP_URL}
   - Keep formatting clean with emojis and line breaks.

RESPOND ONLY WITH A VALID JSON OBJECT (no markdown outside the JSON, no backtick wrap outside JSON):
{
  "publicReply": "string",
  "privateMessage": "string"
}
`;

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  const tryGenerateWithModel = async (modelName: string): Promise<{ publicReply: string; privateMessage: string }> => {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        temperature: 0.7,
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text?.trim() || '{}';
    const cleaned = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    const parsed = JSON.parse(cleaned);

    if (!parsed.publicReply || !parsed.privateMessage) {
      throw new Error(`Incomplete response from ${modelName}`);
    }

    return {
      publicReply: parsed.publicReply.trim(),
      privateMessage: parsed.privateMessage.trim(),
    };
  };

  try {
    console.log(`[Facebook AutoReply] Generating replies using model: ${REPLY_MODEL}`);
    return await tryGenerateWithModel(REPLY_MODEL);
  } catch (primaryErr: any) {
    console.warn(`[Facebook AutoReply] Model ${REPLY_MODEL} failed, falling back to ${FALLBACK_MODEL}:`, primaryErr?.message || primaryErr);
    try {
      return await tryGenerateWithModel(FALLBACK_MODEL);
    } catch (fallbackErr: any) {
      console.error('[Facebook AutoReply] Fallback model also failed:', fallbackErr);
      // Hardcoded high quality fallback
      return {
        publicReply: `Thanks for the comment, ${firstName}! 🙌 I've sent you a quick private message with the full link and details—check your inbox! 🚀`,
        privateMessage: `Hi ${firstName}! 👋\n\nThanks for checking out my post about ${postTitle}!\n\n🔗 You can read the complete article, code examples, and architecture breakdown here:\n👉 ${targetUrl}\n\nFeel free to explore my latest developer resources and open-source tools at:\n🌐 ${APP_URL}\n\nHave a great day and happy coding! 💻✨\n— Nafis Mahmud Ayon`,
      };
    }
  }
}

/**
 * Handles incoming Facebook comment events from webhook payload
 */
export async function handleIncomingFacebookComment(
  value: FacebookCommentEventValue
): Promise<{ processed: boolean; reason: string }> {
  const FB_PAGE_ID = process.env.FB_PAGE_ID;
  const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
    console.warn('[Facebook AutoReply] Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN');
    return { processed: false, reason: 'Missing Facebook credentials in environment' };
  }

  const { item, verb, comment_id: commentId, post_id: postId, message: commentText, from } = value;

  // 1. Only process new comments
  if (item !== 'comment' || verb !== 'add') {
    return { processed: false, reason: `Ignored non-comment or non-add event (${item}:${verb})` };
  }

  // 2. Ignore comments posted by the page itself to prevent infinite self-reply loops
  if (from?.id === FB_PAGE_ID) {
    return { processed: false, reason: 'Ignored comment made by the page itself' };
  }

  if (!commentId || !commentText) {
    return { processed: false, reason: 'Missing commentId or message text' };
  }

  await connectDB();

  // 3. Prevent duplicate replies
  const existing = await FacebookCommentReply.findOne({ commentId });
  if (existing) {
    return { processed: false, reason: 'Comment already processed and replied' };
  }

  console.log(`[Facebook AutoReply] New comment from ${from?.name || 'User'} (${commentId}): "${commentText}"`);

  try {
    // 4. Resolve Post Context
    const postContext = await getFacebookPostContext(postId, FB_PAGE_ACCESS_TOKEN);

    // 5. Generate AI Replies using gemma-4-31b-it
    const { publicReply, privateMessage } = await generateAiReplies(
      commentText,
      from?.name,
      postContext
    );

    console.log(`[Facebook AutoReply] Generated Public Reply: "${publicReply}"`);
    console.log(`[Facebook AutoReply] Generated Private DM: "${privateMessage.slice(0, 100)}..."`);

    // 6. Send Public Comment Reply
    const publicResult = await sendFacebookCommentReply(
      commentId,
      publicReply,
      FB_PAGE_ACCESS_TOKEN
    );

    // 7. Send Private Direct Message (Private Reply)
    const privateResult = await sendFacebookPrivateReply(
      commentId,
      privateMessage,
      FB_PAGE_ACCESS_TOKEN
    );

    // 8. Record in database
    await FacebookCommentReply.create({
      commentId,
      postId: postId || 'unknown',
      blogPostId: postContext.blogPostId || null,
      blogPostSlug: postContext.blogPostSlug || null,
      blogPostTitle: postContext.blogPostTitle || null,
      senderId: from?.id || null,
      senderName: from?.name || null,
      userComment: commentText,
      postContext: postContext.contextText,
      aiPublicReply: publicReply,
      replyCommentId: publicResult.replyId || null,
      aiPrivateReply: privateMessage,
      privateReplyMessageId: privateResult.messageId || null,
      privateReplyStatus: privateResult.success ? 'success' : 'failed',
      privateReplyError: privateResult.error || null,
      status: publicResult.success ? 'success' : 'failed',
      error: publicResult.error || null,
    });

    return {
      processed: true,
      reason: `Public reply ${publicResult.success ? 'sent' : 'failed'}; Private reply ${privateResult.success ? 'sent' : 'failed'}`,
    };
  } catch (err: any) {
    console.error('[Facebook AutoReply] Error handling comment:', err);

    try {
      await FacebookCommentReply.create({
        commentId,
        postId: postId || 'unknown',
        senderId: from?.id || null,
        senderName: from?.name || null,
        userComment: commentText,
        status: 'failed',
        error: err?.message || String(err),
      });
    } catch {}

    return { processed: false, reason: err?.message || 'Error occurred' };
  }
}
