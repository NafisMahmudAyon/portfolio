import { connectDB } from '@/lib/db';
import BlogPost, { IBlogPost } from '@/models/BlogPost';
import SocialPost from '@/models/SocialPost';

export interface FacebookPostResult {
  success: boolean;
  fbPostId?: string;
  fbPostUrl?: string;
  commentId?: string;
  error?: string;
}

/**
 * Posts a blog post to the configured Facebook Page
 */
export async function postBlogToFacebook(blogPost: IBlogPost): Promise<FacebookPostResult> {
  const FB_PAGE_ID = process.env.FB_PAGE_ID;
  const FB_PAGE_ACCESS_TOKEN = process.env.FB_PAGE_ACCESS_TOKEN;
  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://nafisbd.com').replace(/\/$/, '');

  if (!FB_PAGE_ID || !FB_PAGE_ACCESS_TOKEN) {
    console.warn('⚠️ Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN. Skipping Facebook posting.');
    return {
      success: false,
      error: 'Missing FB_PAGE_ID or FB_PAGE_ACCESS_TOKEN in environment variables',
    };
  }

  const postUrl = `${APP_URL}/blog/${blogPost.slug}`;

  // Build engaging Facebook caption
  const hashtags = (blogPost.tags || [])
    .slice(0, 7)
    .map((tag) => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`)
    .concat(['#WebDev', '#TechTrends', '#Coding', '#NafisDev'])
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(' ');

  const caption = [
    `🚀 New Tech Article: ${blogPost.title}`,
    `\n💡 ${blogPost.excerpt}`,
    `\n📚 Topic: ${blogPost.category} | ⏱️ ${blogPost.readTime}`,
    `\n👉 Read the full tutorial & code examples here:\n🔗 ${postUrl}`,
    `\n${hashtags}`,
  ].join('\n');

  try {
    let fbPostId: string | null = null;

    // If there's a valid remote cover image, post as photo with caption; otherwise post to feed
    if (blogPost.coverImage && blogPost.coverImage.startsWith('http')) {
      const photoEndpoint = `https://graph.facebook.com/v21.0/${FB_PAGE_ID}/photos`;
      const res = await fetch(photoEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          url: blogPost.coverImage,
          caption: caption,
          access_token: FB_PAGE_ACCESS_TOKEN,
        }),
      });

      const data = await res.json();
      if (!res.ok || (!data.id && !data.post_id)) {
        console.error('Facebook Photo Post Error:', data);
        // Fallback to feed post if photo URL failed
        fbPostId = await postToFeed(FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, caption, postUrl);
      } else {
        fbPostId = data.post_id || data.id;
      }
    } else {
      fbPostId = await postToFeed(FB_PAGE_ID, FB_PAGE_ACCESS_TOKEN, caption, postUrl);
    }

    if (!fbPostId) {
      throw new Error('Could not retrieve Facebook post ID from response');
    }

    // Construct Facebook Post URL
    // Standard format: https://facebook.com/{postId} or https://facebook.com/{pageId}/posts/{postId}
    const cleanId = fbPostId.includes('_') ? fbPostId.split('_')[1] : fbPostId;
    const fbPostUrl = `https://www.facebook.com/${FB_PAGE_ID}/posts/${cleanId}`;

    // Post follow-up first comment with direct link
    let commentId: string | undefined = undefined;
    try {
      const commentRes = await fetch(`https://graph.facebook.com/v21.0/${fbPostId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          message: `📌 Bookmark this article or read online on my portfolio:\n👉 ${postUrl}\n\nHave questions or thoughts? Drop them in the comments below! 👇`,
          access_token: FB_PAGE_ACCESS_TOKEN,
        }),
      });
      const commentData = await commentRes.json();
      if (commentData.id) {
        commentId = commentData.id;
      }
    } catch (cErr) {
      console.warn('Facebook comment post failed:', cErr);
    }

    // Update blog post in MongoDB
    await connectDB();
    await BlogPost.findByIdAndUpdate(blogPost._id, {
      facebookPostId: fbPostId,
      facebookPostUrl: fbPostUrl,
    });

    // Save SocialPost record
    await SocialPost.create({
      blogPostId: blogPost._id,
      platform: 'facebook',
      status: 'success',
      caption,
      externalPostId: fbPostId,
      externalUrl: fbPostUrl,
      comments: commentId ? [commentId] : [],
      postedAt: new Date(),
    });

    return {
      success: true,
      fbPostId,
      fbPostUrl,
      commentId,
    };
  } catch (err: any) {
    console.error('Facebook posting exception:', err);

    try {
      await connectDB();
      await SocialPost.create({
        blogPostId: blogPost._id,
        platform: 'facebook',
        status: 'failed',
        caption,
        errorMessage: err?.message || String(err),
        postedAt: new Date(),
      });
    } catch {}

    return {
      success: false,
      error: err?.message || 'Failed to post on Facebook',
    };
  }
}

async function postToFeed(
  pageId: string,
  accessToken: string,
  message: string,
  link: string
): Promise<string> {
  const feedEndpoint = `https://graph.facebook.com/v21.0/${pageId}/feed`;
  const res = await fetch(feedEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      message,
      link,
      access_token: accessToken,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(data.error?.message || JSON.stringify(data));
  }
  return data.id;
}
