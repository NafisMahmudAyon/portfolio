import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBlogPost } from '@/lib/blog-generator';

export const maxDuration = 60; // Allow up to 60s for Gemini generation on Vercel

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { topic, category, postToFacebook, secret } = body;

    const validSecret = process.env.CRON_SECRET || process.env.SOCIAL_API_KEY;
    if (validSecret && secret !== validSecret) {
      // Check auth header as alternative
      const authHeader = req.headers.get('authorization');
      const headerKey = req.headers.get('x-social-api-key');
      if (
        headerKey !== validSecret &&
        authHeader !== `Bearer ${validSecret}`
      ) {
        return NextResponse.json({ error: 'Unauthorized: invalid security key' }, { status: 401 });
      }
    }

    const result = await generateDailyBlogPost({
      customTopic: topic,
      category,
      postToFacebook: postToFacebook !== false,
    });

    return NextResponse.json({
      success: true,
      blog: result.blog,
      facebook: result.facebookResult,
    });
  } catch (err: any) {
    console.error('API /api/blog/generate error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to generate blog' },
      { status: 500 }
    );
  }
}
