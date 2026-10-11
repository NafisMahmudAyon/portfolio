import { Metadata } from 'next';
import BlogListClient from './BlogListClient';

export const metadata: Metadata = {
  title: 'Tech Blog & AI Tutorials | Nafis Mahmud Ayon',
  description:
    'Daily tech articles, deep-dive tutorials, modern JavaScript, TypeScript, AI engineering, web performance, and free developer tools by Nafis Mahmud Ayon.',
  keywords: [
    'Tech Blog',
    'JavaScript Tutorials',
    'TypeScript Guide',
    'AI Development',
    'Next.js Tutorials',
    'Web Development',
    'Frontend Architecture',
    'Free Developer Resources',
  ],
  openGraph: {
    title: 'Tech Blog & AI Tutorials | Nafis Mahmud Ayon',
    description:
      'Daily tech insights, guides, and tutorials on modern web development, TypeScript, and AI engineering.',
    url: 'https://nafisbd.com/blog',
    siteName: 'Nafis Mahmud Ayon Portfolio',
    images: [
      {
        url: 'https://nafisbd.com/nafis-mahmud-ayon.png',
        width: 1200,
        height: 630,
        alt: 'Nafis Mahmud Ayon Tech Blog',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tech Blog & AI Tutorials | Nafis Mahmud Ayon',
    description:
      'Daily tech insights, guides, and tutorials on modern web development, TypeScript, and AI engineering.',
  },
};

export default function BlogPage() {
  return <BlogListClient />;
}
