'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb, BreadcrumbItem, Card } from '@/components/aspect-ui';
import Footer from '@/components/Footer/Footer';
import PageTitle from '@/components/PageTitle';
import Chatbot from '@/components/Chatbot';
import MarkdownContent from '@/components/MarkdownContent';
import { poppins } from '@/app/fonts';
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  ArrowRight,
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Tag,
  ExternalLink,
  MessageSquare,
} from 'lucide-react';

interface PostData {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: string;
  authorRole: string;
  authorImage?: string;
  readTime: string;
  publishedAt: string;
  views: number;
  facebookPostId?: string;
  facebookPostUrl?: string;
}

interface BlogPostClientProps {
  post: PostData;
  navigation: {
    prev: { title: string; slug: string } | null;
    next: { title: string; slug: string } | null;
  };
  relatedPosts: Array<{
    _id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    category: string;
    publishedAt: string;
    readTime: string;
  }>;
}

export default function BlogPostClient({ post, navigation, relatedPosts }: BlogPostClientProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== 'undefined' ? window.location.href : `https://nafisbd.com/blog/${post.slug}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  const shareTwitter = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(post.title)}`;
  const shareLinkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;

  return (
    <main className="w-full overflow-hidden">
      {/* Top Header Banner */}
      <div
        id="home"
        className="background shadow-normalText/25 mx-auto mt-4 w-full rounded-t-3xl bg-[#f1f6fb] pt-6 pb-12 shadow drop-shadow-md backdrop-blur-3xl lg:max-w-[1440px] dark:bg-[#262626]"
      >
        <div className="flex items-center justify-between px-4 md:px-8 lg:px-12">
          <Breadcrumb>
            <BreadcrumbItem>
              <Link href="/">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link href="/blog">Blog</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <span className="line-clamp-1 max-w-[200px] md:max-w-[350px]">{post.title}</span>
            </BreadcrumbItem>
          </Breadcrumb>

          <Link
            href="/blog"
            className="flex items-center gap-1.5 text-xs font-medium text-normalText hover:text-primaryColor dark:text-normalDarkText"
          >
            <ArrowLeft className="size-3.5" />
            <span>All Articles</span>
          </Link>
        </div>

        {/* Article Header Details */}
        <div className="mx-auto mt-8 max-w-4xl px-4 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-primaryColor px-3 py-1 text-xs font-semibold text-white shadow">
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-normalText/80 dark:text-normalDarkText/80">
              <Clock className="size-3" />
              {post.readTime}
            </span>
            <span className="text-normalText/40">•</span>
            <span className="flex items-center gap-1 text-xs text-normalText/80 dark:text-normalDarkText/80">
              <Calendar className="size-3" />
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
            {post.views > 0 && (
              <>
                <span className="text-normalText/40">•</span>
                <span className="flex items-center gap-1 text-xs text-normalText/80 dark:text-normalDarkText/80">
                  <Eye className="size-3" />
                  {post.views} views
                </span>
              </>
            )}
          </div>

          <h1
            className={`mt-4 text-2xl font-bold leading-tight text-headingText md:text-3xl lg:text-4xl ${poppins.className}`}
          >
            {post.title}
          </h1>

          <p className="mt-3 text-sm font-light text-normalText dark:text-normalDarkText md:text-base">
            {post.excerpt}
          </p>

          {/* Author Badge */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="relative size-10 overflow-hidden rounded-full border border-primaryColor/40 shadow">
              <Image
                src={post.authorImage || '/nafis-mahmud-ayon.png'}
                alt={post.author}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-semibold text-headingText dark:text-headingDarkText">
                {post.author}
              </h4>
              <p className="text-[11px] text-normalText/70 dark:text-normalDarkText/70">
                {post.authorRole}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Article Body */}
      <div className="shadow-normalText/25 mx-auto mb-4 max-w-[1440px] rounded-b-3xl px-4 pt-8 pb-12 shadow drop-shadow-md backdrop-blur-3xl md:px-8 lg:px-12">
        <article className="mx-auto max-w-4xl">
          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative mb-8 h-64 w-full overflow-hidden rounded-2xl shadow-lg md:h-96 lg:h-[450px]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          {/* Facebook Link Notice Banner */}
          {post.facebookPostUrl && (
            <div className="mb-8 flex flex-col items-start justify-between gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Facebook className="size-4 shrink-0" />
                <span>
                  This article is featured on our official <strong>Facebook Page</strong>! Join the discussion or leave a comment.
                </span>
              </div>
              <a
                href={post.facebookPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white shadow transition hover:bg-blue-700"
              >
                <span>View Facebook Post</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          )}

          {/* Social Share Bar */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-y border-normalText/10 py-3 dark:border-normalDarkText/10">
            <span className="flex items-center gap-2 text-xs font-medium text-normalText dark:text-normalDarkText">
              <Share2 className="size-3.5 text-primaryColor" />
              <span>Share this article:</span>
            </span>

            <div className="flex items-center gap-2">
              <a
                href={shareFacebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-600 transition hover:bg-blue-600 hover:text-white"
                title="Share on Facebook"
              >
                <Facebook className="size-4" />
              </a>
              <a
                href={shareTwitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-500 transition hover:bg-sky-500 hover:text-white"
                title="Share on X"
              >
                <Twitter className="size-4" />
              </a>
              <a
                href={shareLinkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-8 items-center justify-center rounded-full bg-blue-700/10 text-blue-700 transition hover:bg-blue-700 hover:text-white"
                title="Share on LinkedIn"
              >
                <Linkedin className="size-4" />
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 rounded-full border border-normalText/20 px-3 py-1 text-xs text-normalText transition hover:border-primaryColor dark:border-normalDarkText/20 dark:text-normalDarkText"
                title="Copy link"
              >
                {copied ? (
                  <>
                    <Check className="size-3.5 text-green-500" />
                    <span className="text-green-500 font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Rich Content Renderer */}
          <div className="text-normalText dark:text-normalDarkText">
            <MarkdownContent content={post.content} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-normalText/10 pt-6 dark:border-normalDarkText/10">
              <span className="text-xs font-semibold text-headingText dark:text-headingDarkText">
                Tags:
              </span>
              {post.tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-full bg-primaryColor/10 px-3 py-1 text-xs text-primaryColor dark:bg-primaryColor/20"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Previous / Next Article Navigation */}
          <div className="mt-12 grid grid-cols-1 gap-4 border-t border-normalText/10 pt-8 sm:grid-cols-2 dark:border-normalDarkText/10">
            {navigation.prev ? (
              <Link
                href={`/blog/${navigation.prev.slug}`}
                className="group flex flex-col rounded-xl border border-normalText/10 bg-white/30 p-4 transition hover:border-primaryColor dark:border-normalDarkText/10 dark:bg-black/20"
              >
                <span className="flex items-center gap-1 text-[11px] text-normalText/60 dark:text-normalDarkText/60">
                  <ArrowLeft className="size-3" />
                  <span>Previous Article</span>
                </span>
                <span className="mt-1 line-clamp-1 text-sm font-semibold text-headingText group-hover:text-primaryColor dark:text-headingDarkText">
                  {navigation.prev.title}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {navigation.next && (
              <Link
                href={`/blog/${navigation.next.slug}`}
                className="group flex flex-col items-end text-right rounded-xl border border-normalText/10 bg-white/30 p-4 transition hover:border-primaryColor dark:border-normalDarkText/10 dark:bg-black/20"
              >
                <span className="flex items-center gap-1 text-[11px] text-normalText/60 dark:text-normalDarkText/60">
                  <span>Next Article</span>
                  <ArrowRight className="size-3" />
                </span>
                <span className="mt-1 line-clamp-1 text-sm font-semibold text-headingText group-hover:text-primaryColor dark:text-headingDarkText">
                  {navigation.next.title}
                </span>
              </Link>
            )}
          </div>

          {/* Related Articles Section */}
          {relatedPosts.length > 0 && (
            <div className="mt-16 border-t border-normalText/10 pt-10 dark:border-normalDarkText/10">
              <h3 className="text-xl font-bold text-headingText dark:text-headingDarkText">
                Related Articles in {post.category}
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((rel) => (
                  <Card
                    key={rel._id}
                    className="flex flex-col justify-between overflow-hidden rounded-xl border border-normalText/15 bg-white/40 p-0 shadow-sm transition hover:shadow-md dark:border-normalDarkText/15 dark:bg-black/20"
                  >
                    <div className="p-4">
                      <span className="text-[10px] text-primaryColor font-semibold uppercase">
                        {rel.category}
                      </span>
                      <h4 className="mt-1.5 line-clamp-2 text-sm font-bold text-headingText hover:text-primaryColor dark:text-headingDarkText">
                        <Link href={`/blog/${rel.slug}`}>{rel.title}</Link>
                      </h4>
                      <p className="mt-2 line-clamp-2 text-xs font-light text-normalText dark:text-normalDarkText">
                        {rel.excerpt}
                      </p>
                    </div>
                    <div className="border-t border-normalText/10 p-3 text-[11px] text-primaryColor font-medium dark:border-normalDarkText/10">
                      <Link href={`/blog/${rel.slug}`} className="inline-flex items-center gap-1">
                        Read Story <ArrowRight className="size-3" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Call To Action Box */}
          <div className="mt-16 rounded-2xl border border-primaryColor/30 bg-primaryColor/10 p-8 text-center backdrop-blur-md">
            <h3 className="text-xl font-bold text-headingText dark:text-headingDarkText">
              Let's Build Something Awesome Together
            </h3>
            <p className="mx-auto mt-2 max-w-xl text-xs font-light text-normalText dark:text-normalDarkText">
              Looking for a frontend specialist, custom UI component library, or full-stack application development? Send a message or chat with my AI assistant.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/#contact"
                className="rounded-lg bg-primaryColor px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-primaryColor/80"
              >
                Hire / Contact Me
              </Link>
              <Link
                href="/projects"
                className="rounded-lg border border-normalText/20 px-5 py-2 text-xs font-semibold text-normalText hover:border-primaryColor dark:border-normalDarkText/20 dark:text-normalDarkText"
              >
                Explore Projects
              </Link>
            </div>
          </div>
        </article>

        <Footer />
      </div>

      <Chatbot />
    </main>
  );
}
