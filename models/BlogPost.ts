import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IBlogPost extends Document {
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
  isPublished: boolean;
  publishedAt: Date;
  views: number;
  likes: number;
  facebookPostId?: string;
  facebookPostUrl?: string;
  aiGenerated: boolean;
  aiModel?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    coverImage: { type: String, default: '' },
    category: { type: String, required: true, default: 'Tech Trends', index: true },
    tags: [{ type: String, trim: true }],
    author: { type: String, default: 'Nafis Mahmud Ayon' },
    authorRole: { type: String, default: 'Frontend & Fullstack Developer' },
    authorImage: { type: String, default: '/nafis-mahmud-ayon.png' },
    readTime: { type: String, default: '5 min read' },
    isPublished: { type: Boolean, default: true, index: true },
    publishedAt: { type: Date, default: Date.now, index: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    facebookPostId: { type: String, default: '' },
    facebookPostUrl: { type: String, default: '' },
    aiGenerated: { type: Boolean, default: true },
    aiModel: { type: String, default: 'gemini-3.8-flash' },
  },
  {
    timestamps: true,
  }
);

// Prevent re-compilation of model in dev / serverless
const BlogPost = models.BlogPost || model<IBlogPost>('BlogPost', BlogPostSchema);

export default BlogPost;
