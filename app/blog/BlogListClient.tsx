'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Breadcrumb, BreadcrumbItem, Card, Button } from '@/components/aspect-ui';
import Footer from '@/components/Footer/Footer';
import PageTitle from '@/components/PageTitle';
import Chatbot from '@/components/Chatbot';
import { poppins } from '@/app/fonts';
import {
  Search,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  Facebook,
  Tag,
  BookOpen,
} from 'lucide-react';

interface BlogPostSummary {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags: string[];
  readTime: string;
  publishedAt: string;
  views: number;
  facebookPostId?: string;
  facebookPostUrl?: string;
}

const CATEGORIES = [
  'All',
  'AI & Machine Learning',
  'TypeScript & JavaScript',
  'Web Standards & HTML',
  'Tutorials & How-To',
  'Free Tools & Resources',
];

export default function BlogListClient() {
  const [blogs, setBlogs] = useState<BlogPostSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Generator modal state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customCategory, setCustomCategory] = useState('AI & Machine Learning');
  const [postFacebook, setPostFacebook] = useState(true);
  const [generateStatus, setGenerateStatus] = useState<string | null>(null);

  const fetchBlogs = async (cat = selectedCategory, s = search, p = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== 'All') params.set('category', cat);
      if (s) params.set('search', s);
      params.set('page', String(p));
      params.set('limit', '9');

      const res = await fetch(`/api/blog?${params.toString()}`);
      const data = await res.json();
      if (data.blogs) {
        setBlogs(data.blogs);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (e) {
      console.error('Failed to fetch blogs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(selectedCategory, search, page);
  }, [selectedCategory, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchBlogs(selectedCategory, search, 1);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerateStatus('Crafting high-quality technical article with Gemini 3.8 Flash...');

    try {
      const res = await fetch('/api/cron/daily-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: customTopic.trim() || undefined,
          category: customCategory,
          postToFacebook: postFacebook,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate blog post');
      }

      setGenerateStatus(
        postFacebook && data.facebook?.success
          ? '🎉 Blog post created & published to Facebook Page successfully!'
          : '🎉 Blog post generated and saved to database!'
      );

      // Refresh list
      fetchBlogs(selectedCategory, search, 1);

      setTimeout(() => {
        setIsGenerating(false);
        setGenerateModalOpen(false);
        setGenerateStatus(null);
        setCustomTopic('');
      }, 2000);
    } catch (err: any) {
      console.error('Generate error:', err);
      setGenerateStatus(`❌ Error: ${err.message}`);
      setIsGenerating(false);
    }
  };

  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const regularPosts = blogs.length > 0 ? blogs.slice(1) : [];

  return (
    <main className="w-full overflow-hidden">
      {/* Top Banner Section */}
      <div
        id="home"
        className="background shadow-normalText/25 mx-auto mt-4 w-full rounded-t-3xl bg-[#f1f6fb] pt-6 pb-12 shadow drop-shadow-md backdrop-blur-3xl lg:max-w-[1440px] dark:bg-[#262626]"
      >
        <PageTitle
          title="Tech Blog & Tutorials"
          className="flex w-full justify-center px-3 pt-10 text-2xl text-wrap"
        />

        <div className="flex flex-col items-center justify-between gap-4 px-4 pt-2 md:flex-row md:px-8 lg:px-12">
          <Breadcrumb>
            <BreadcrumbItem>
              <Link href="/">Home</Link>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <Link href="/blog">Blog</Link>
            </BreadcrumbItem>
          </Breadcrumb>

          {/* Quick AI Trigger Button */}
          <button
            onClick={() => setGenerateModalOpen(true)}
            className="flex items-center gap-2 rounded-full border border-primaryColor/40 bg-primaryColor/10 px-4 py-1.5 text-xs font-medium text-headingText shadow-sm transition-all hover:bg-primaryColor hover:text-white dark:text-headingDarkText"
          >
            <Sparkles className="size-3.5 text-primaryColor animate-pulse" />
            <span>Generate Daily Post with AI</span>
          </button>
        </div>

        {/* Subtitle & Tagline */}
        <p
          className={`mx-auto mt-4 max-w-2xl px-4 text-center text-sm font-light text-normalText dark:text-normalDarkText ${poppins.className}`}
        >
          Daily developer insights, modern JavaScript & TypeScript patterns, AI workflows, and practical step-by-step tutorials posted to Facebook and the web.
        </p>

        {/* Search Bar */}
        <div className="mx-auto mt-6 max-w-xl px-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search articles by title, topic, or keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border border-normalText/20 bg-white/70 px-5 py-3 pr-24 text-sm text-headingText placeholder-normalText/50 shadow-inner backdrop-blur-md focus:border-primaryColor focus:outline-none dark:border-normalDarkText/20 dark:bg-black/30 dark:text-headingDarkText"
            />
            <button
              type="submit"
              className="absolute right-2 flex items-center gap-1 rounded-full bg-primaryColor px-4 py-2 text-xs font-medium text-white transition hover:bg-primaryColor/80"
            >
              <Search className="size-3.5" />
              <span>Search</span>
            </button>
          </form>
        </div>

        {/* Category Filter Pills */}
        <div className="mx-auto mt-6 flex max-w-4xl flex-wrap items-center justify-center gap-2 px-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setPage(1);
              }}
              className={`rounded-full px-3.5 py-1 text-xs transition-all ${
                selectedCategory === cat
                  ? 'bg-primaryColor text-white shadow-md'
                  : 'border border-normalText/20 bg-white/40 text-normalText hover:border-primaryColor dark:border-normalDarkText/20 dark:bg-black/20 dark:text-normalDarkText'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="shadow-normalText/25 mx-auto mb-4 max-w-[1440px] rounded-b-3xl px-4 pt-8 pb-12 shadow drop-shadow-md backdrop-blur-3xl md:px-8 lg:px-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-normalText dark:text-normalDarkText">
            <RefreshCw className="size-8 animate-spin text-primaryColor" />
            <p className="mt-4 text-sm font-light">Loading articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-normalText/30 py-20 text-center dark:border-normalDarkText/30">
            <BookOpen className="size-12 text-primaryColor/60" />
            <h3 className="mt-4 text-lg font-semibold text-headingText dark:text-headingDarkText">
              No blog posts found
            </h3>
            <p className="mt-1 max-w-md text-sm text-normalText dark:text-normalDarkText">
              {search
                ? `No posts matched "${search}". Try another query or category.`
                : 'No posts in this category yet. Click below to generate the very first post using Gemini AI!'}
            </p>
            <button
              onClick={() => setGenerateModalOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-primaryColor px-5 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-primaryColor/80"
            >
              <Sparkles className="size-4" />
              <span>Generate First Post Now</span>
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Featured Post Card (Top Article) */}
            {featuredPost && (
              <div className="group relative overflow-hidden rounded-2xl border border-normalText/20 bg-white/40 p-1 shadow-lg transition-all duration-300 hover:shadow-2xl dark:border-normalDarkText/20 dark:bg-[#1f1f1f]/60">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                  <div className="relative h-64 overflow-hidden rounded-xl lg:col-span-7 lg:h-80">
                    <Image
                      src={
                        featuredPost.coverImage ||
                        'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
                      }
                      alt={featuredPost.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      unoptimized
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="rounded-full bg-primaryColor px-3 py-1 text-xs font-semibold text-white shadow">
                        Featured
                      </span>
                      <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                        {featuredPost.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-4 lg:col-span-5 lg:p-6">
                    <div>
                      <div className="flex items-center gap-4 text-xs text-normalText/70 dark:text-normalDarkText/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          {new Date(featuredPost.publishedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="size-3.5" />
                          {featuredPost.readTime}
                        </span>
                      </div>

                      <h3
                        className={`mt-3 text-xl font-bold text-headingText transition group-hover:text-primaryColor lg:text-2xl ${poppins.className}`}
                      >
                        <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                      </h3>

                      <p className="mt-3 line-clamp-3 text-sm font-light text-normalText dark:text-normalDarkText">
                        {featuredPost.excerpt}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-1.5">
                        {featuredPost.tags?.slice(0, 4).map((tag, i) => (
                          <span
                            key={i}
                            className="flex items-center gap-1 rounded-md bg-primaryColor/10 px-2 py-0.5 text-[11px] text-primaryColor dark:bg-primaryColor/20"
                          >
                            <Tag className="size-2.5" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-normalText/10 dark:border-normalDarkText/10">
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-primaryColor hover:underline"
                      >
                        <span>Read Full Article</span>
                        <ArrowRight className="size-4" />
                      </Link>

                      {featuredPost.facebookPostUrl && (
                        <a
                          href={featuredPost.facebookPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600"
                          title="View on Facebook"
                        >
                          <Facebook className="size-3.5" />
                          <span className="hidden sm:inline">On Facebook</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grid of Other Articles */}
            {regularPosts.length > 0 && (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularPosts.map((post) => (
                  <Card
                    key={post._id}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-normalText/20 bg-white/40 p-0 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-normalDarkText/20 dark:bg-[#1f1f1f]/50"
                  >
                    <div>
                      {/* Image Thumbnail */}
                      <div className="relative h-48 w-full overflow-hidden">
                        <Image
                          src={
                            post.coverImage ||
                            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80'
                          }
                          alt={post.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                        <span className="absolute top-3 left-3 rounded-full bg-black/60 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-md">
                          {post.category}
                        </span>
                      </div>

                      <div className="p-5">
                        <div className="flex items-center justify-between text-[11px] text-normalText/70 dark:text-normalDarkText/70">
                          <span className="flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(post.publishedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {post.readTime}
                          </span>
                        </div>

                        <h4
                          className={`mt-2.5 line-clamp-2 text-base font-bold text-headingText transition group-hover:text-primaryColor ${poppins.className}`}
                        >
                          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                        </h4>

                        <p className="mt-2 line-clamp-3 text-xs font-light text-normalText dark:text-normalDarkText">
                          {post.excerpt}
                        </p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {post.tags?.slice(0, 3).map((tag, i) => (
                            <span
                              key={i}
                              className="rounded bg-black/5 px-2 py-0.5 text-[10px] text-normalText dark:bg-white/10 dark:text-normalDarkText"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-normalText/10 p-4 dark:border-normalDarkText/10">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primaryColor hover:underline"
                      >
                        <span>Read More</span>
                        <ArrowRight className="size-3.5" />
                      </Link>

                      {post.facebookPostUrl && (
                        <a
                          href={post.facebookPostUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-600"
                          title="View on Facebook"
                        >
                          <Facebook className="size-3" />
                          <span>FB Post</span>
                        </a>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-8">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-normalText/20 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-normalText dark:text-normalDarkText">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-lg border border-normalText/20 px-3 py-1.5 text-xs font-medium disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}

        <Footer />
      </div>

      {/* Interactive AI Generation Modal */}
      {generateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-normalText/20 bg-bg p-6 shadow-2xl dark:border-normalDarkText/20 dark:bg-[#202020]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="size-5 text-primaryColor" />
                <h3 className="text-lg font-bold text-headingText dark:text-headingDarkText">
                  AI Blog & Facebook Publisher
                </h3>
              </div>
              <button
                disabled={isGenerating}
                onClick={() => setGenerateModalOpen(false)}
                className="text-normalText hover:text-primaryColor dark:text-normalDarkText"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs text-normalText/80 dark:text-normalDarkText/80">
              Generates a comprehensive tech article using <strong>Gemini 3.8 Flash</strong>, saves it to <strong>MongoDB</strong>, and publishes it automatically to your <strong>Facebook Page</strong> with comments!
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-headingText dark:text-headingDarkText">
                  Category Topic
                </label>
                <select
                  disabled={isGenerating}
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-normalText/20 bg-white/60 p-2.5 text-xs text-headingText dark:border-normalDarkText/20 dark:bg-black/30 dark:text-headingDarkText"
                >
                  {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-headingText dark:text-headingDarkText">
                  Custom Topic / Prompt (Optional)
                </label>
                <input
                  type="text"
                  disabled={isGenerating}
                  placeholder="e.g. 5 Game-Changing TypeScript 5.5 Features You Need Today"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-normalText/20 bg-white/60 p-2.5 text-xs text-headingText dark:border-normalDarkText/20 dark:bg-black/30 dark:text-headingDarkText"
                />
                <span className="text-[10px] text-normalText/60 dark:text-normalDarkText/60">
                  Leave empty to let AI pick from rotating tech, JS, TS, HTML, and tutorial ideas.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="postFacebook"
                  disabled={isGenerating}
                  checked={postFacebook}
                  onChange={(e) => setPostFacebook(e.target.checked)}
                  className="size-4 accent-primaryColor"
                />
                <label
                  htmlFor="postFacebook"
                  className="cursor-pointer text-xs font-medium text-headingText dark:text-headingDarkText flex items-center gap-1.5"
                >
                  <Facebook className="size-3.5 text-blue-500" />
                  <span>Also post immediately to Facebook Page (via Graph API)</span>
                </label>
              </div>

              {generateStatus && (
                <div className="rounded-lg bg-primaryColor/10 p-3 text-xs font-medium text-primaryColor">
                  {generateStatus}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                disabled={isGenerating}
                onClick={() => setGenerateModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-medium text-normalText hover:bg-black/5 dark:text-normalDarkText"
              >
                Cancel
              </button>
              <button
                disabled={isGenerating}
                onClick={handleGenerate}
                className="flex items-center gap-2 rounded-lg bg-primaryColor px-5 py-2 text-xs font-semibold text-white shadow transition hover:bg-primaryColor/80 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="size-3.5 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    <span>Generate & Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot Assistant */}
      <Chatbot />
    </main>
  );
}
