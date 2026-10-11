import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import BlogPost from '@/models/BlogPost';
import BlogPostClient from './BlogPostClient';

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const blog = await BlogPost.findOne({ slug, isPublished: true }).lean();

  const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://nafisbd.com').replace(/\/$/, '');

  if (!blog) {
    return {
      title: 'Article Not Found | Nafis Mahmud Ayon',
      description: 'The requested article could not be found.',
    };
  }

  const postTitle = (blog as any).title;
  const title = `${postTitle} | Nafis Mahmud Ayon`;
  const description = (blog as any).excerpt || 'Read the full tech article on Nafis Mahmud Ayon portfolio.';
  const url = `${APP_URL}/blog/${slug}`;
  const rawCover = (blog as any).coverImage || '';
  const coverImage = rawCover.startsWith('http')
    ? rawCover
    : `${APP_URL}${rawCover.startsWith('/') ? '' : '/'}${rawCover || 'nafis-mahmud-ayon.png'}`;

  return {
    metadataBase: new URL(APP_URL),
    title,
    description,
    keywords: (blog as any).tags || ['Tech', 'WebDev', 'Tutorial', 'Next.js'],
    authors: [{ name: 'Nafis Mahmud Ayon', url: APP_URL }],
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Nafis Mahmud Ayon Portfolio',
      type: 'article',
      publishedTime: (blog as any).publishedAt?.toISOString(),
      modifiedTime: ((blog as any).updatedAt || (blog as any).publishedAt)?.toISOString(),
      authors: ['Nafis Mahmud Ayon'],
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: postTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [coverImage],
      creator: '@nafis_ayon_bd',
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  // Increment views
  const blog = await BlogPost.findOneAndUpdate(
    { slug, isPublished: true },
    { $inc: { views: 1 } },
    { returnDocument: 'after' }
  ).lean();

  if (!blog) {
    notFound();
  }

  // Get previous and next posts
  const [prevPost, nextPost, related] = await Promise.all([
    BlogPost.findOne({
      publishedAt: { $lt: (blog as any).publishedAt },
      isPublished: true,
    })
      .sort({ publishedAt: -1 })
      .select('title slug')
      .lean(),
    BlogPost.findOne({
      publishedAt: { $gt: (blog as any).publishedAt },
      isPublished: true,
    })
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

  // JSON-LD structured data for article SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: (blog as any).title,
    description: (blog as any).excerpt,
    image: [(blog as any).coverImage || 'https://nafisbd.com/nafis-mahmud-ayon.png'],
    datePublished: (blog as any).publishedAt?.toISOString(),
    dateModified: (blog as any).updatedAt?.toISOString() || (blog as any).publishedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: 'Nafis Mahmud Ayon',
      url: 'https://nafisbd.com',
    },
    publisher: {
      '@type': 'Person',
      name: 'Nafis Mahmud Ayon',
      url: 'https://nafisbd.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://nafisbd.com/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient
        post={JSON.parse(JSON.stringify(blog))}
        navigation={{
          prev: prevPost ? JSON.parse(JSON.stringify(prevPost)) : null,
          next: nextPost ? JSON.parse(JSON.stringify(nextPost)) : null,
        }}
        relatedPosts={JSON.parse(JSON.stringify(related))}
      />
    </>
  );
}
