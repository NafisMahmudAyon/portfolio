import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import BlogPost from '@/models/BlogPost';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    await connectDB();

    const blog = await BlogPost.findOneAndUpdate(
      { slug, isPublished: true },
      { $inc: { views: 1 } },
      { returnDocument: 'after' }
    ).lean();

    if (!blog) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Get previous and next post for bottom navigation
    const [prevPost, nextPost, related] = await Promise.all([
      BlogPost.findOne({ publishedAt: { $lt: (blog as any).publishedAt }, isPublished: true })
        .sort({ publishedAt: -1 })
        .select('title slug')
        .lean(),
      BlogPost.findOne({ publishedAt: { $gt: (blog as any).publishedAt }, isPublished: true })
        .sort({ publishedAt: 1 })
        .select('title slug')
        .lean(),
      BlogPost.find({
        _id: { $ne: (blog as any)._id },
        category: (blog as any).category,
        isPublished: true,
      })
        .limit(3)
        .select('title slug excerpt coverImage category publishedAt readTime')
        .lean(),
    ]);

    return NextResponse.json({
      blog,
      navigation: {
        prev: prevPost,
        next: nextPost,
      },
      related,
    });
  } catch (err: any) {
    console.error('API /api/blog/[slug] GET error:', err);
    return NextResponse.json(
      { error: 'Server error', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
