import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import BlogPost from '@/models/BlogPost';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get('limit') || '12', 10)));
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');

    const filter: Record<string, any> = { isPublished: true };

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (tag) {
      filter.tags = tag;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [blogs, total] = await Promise.all([
      BlogPost.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-content') // Exclude full content for list view performance
        .lean(),
      BlogPost.countDocuments(filter),
    ]);

    // Also get distinct categories for filters
    const categories = await BlogPost.distinct('category', { isPublished: true });

    return NextResponse.json({
      blogs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      categories,
    });
  } catch (err: any) {
    console.error('API /api/blog GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch blogs', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
