import { NextRequest, NextResponse } from 'next/server';
import { generateDailyBlogPost } from '@/lib/blog-generator';

export const maxDuration = 60; // Allow up to 60s for Gemini generation and FB publishing on Vercel Hobby

function isAuthorized(req: NextRequest): boolean {
  const validSecret = process.env.CRON_SECRET || process.env.SOCIAL_API_KEY;
  if (!validSecret) return true; // If no secret configured, allow (or warn)

  const headerKey = req.headers.get('x-social-api-key');
  if (headerKey && headerKey === validSecret) return true;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader === `Bearer ${validSecret}`) return true;

  const queryKey = req.nextUrl.searchParams.get('key');
  if (queryKey && queryKey === validSecret) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const postToFacebook = req.nextUrl.searchParams.get('postFacebook') !== 'false';
    const customTopic = req.nextUrl.searchParams.get('topic') || undefined;
    const category = req.nextUrl.searchParams.get('category') || undefined;

    const result = await generateDailyBlogPost({
      customTopic,
      category,
      postToFacebook,
    });

    return NextResponse.json({
      success: true,
      message: 'Daily blog post generated and processed successfully!',
      blog: {
        id: result.blog._id,
        title: result.blog.title,
        slug: result.blog.slug,
        category: result.blog.category,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nafisbd.com'}/blog/${result.blog.slug}`,
      },
      facebook: result.facebookResult,
    });
  } catch (err: any) {
    console.error('Daily blog cron error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Daily blog generation failed',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {}

    const result = await generateDailyBlogPost({
      customTopic: body.topic,
      category: body.category,
      postToFacebook: body.postToFacebook !== false,
    });

    return NextResponse.json({
      success: true,
      message: 'Blog post generated and processed successfully!',
      blog: {
        id: result.blog._id,
        title: result.blog.title,
        slug: result.blog.slug,
        category: result.blog.category,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://nafisbd.com'}/blog/${result.blog.slug}`,
      },
      facebook: result.facebookResult,
    });
  } catch (err: any) {
    console.error('Daily blog cron POST error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Daily blog generation failed',
      },
      { status: 500 }
    );
  }
}
