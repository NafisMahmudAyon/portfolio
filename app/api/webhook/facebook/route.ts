import { NextRequest, NextResponse, after } from 'next/server';
import { handleIncomingFacebookComment } from '@/lib/facebook-reply';

export const maxDuration = 60;

/**
 * GET Handler — Meta Webhook Verification Handshake
 * Meta calls this when you configure the Callback URL in the App Dashboard.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const cleanExpected = (
      process.env.FB_VERIFY_TOKEN ||
      process.env.FACEBOOK_VERIFY_TOKEN ||
      process.env.FB_WEBHOOK_VERIFY_TOKEN ||
      ''
    ).replace(/^['"]|['"]$/g, '').trim();

    if (!cleanExpected) {
      console.error('❌ [Facebook Webhook GET] FB_VERIFY_TOKEN is not configured in environment variables');
      return new Response('Server configuration error: FB_VERIFY_TOKEN missing', { status: 500 });
    }

    const cleanToken = (token || '').replace(/^['"]|['"]$/g, '').trim();

    if (mode === 'subscribe' && cleanToken === cleanExpected) {
      console.log('✅ [Facebook Webhook GET] Webhook verified successfully by Meta.');
      return new Response(challenge || '', {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    console.warn(
      `⚠️ [Facebook Webhook GET] Token mismatch: received "${token}", expected "${cleanExpected}"`
    );
    return new Response('Forbidden: Invalid verification token', { status: 403 });
  } catch (err: any) {
    console.error('❌ [Facebook Webhook GET Error]:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * POST Handler — Receive Real-Time Events (Comments, Feed Changes, etc.)
 * Meta pushes event pings whenever a user interacts with the page feed.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('[Facebook Webhook POST] Received event payload:', JSON.stringify(body, null, 2));

    if (body.object === 'page') {
      // Use Next.js 15 after() to schedule background processing
      // This immediately releases the HTTP response to Meta (preventing 504 timeouts and retries)
      // while keeping the serverless execution context alive until completed.
      after(async () => {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field === 'feed' && change.value) {
              try {
                const res = await handleIncomingFacebookComment(change.value);
                console.log('[Facebook Webhook POST] Processed comment event:', res);
              } catch (err) {
                console.error('[Facebook Webhook POST] Error processing comment:', err);
              }
            }
          }
        }
      });

      // Meta requires immediate 200 OK response (<20 seconds)
      return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
    }

    console.warn('[Facebook Webhook POST] Ignored non-page object:', body.object);
    return NextResponse.json({ status: 'IGNORED' }, { status: 200 });
  } catch (err: any) {
    console.error('❌ [Facebook Webhook POST Error]:', err);
    // Return 200 to prevent Meta from spamming retries if malformed payload
    return NextResponse.json(
      { status: 'ERROR_HANDLED', message: err?.message || 'Error parsing payload' },
      { status: 200 }
    );
  }
}
