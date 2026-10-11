import { GoogleGenAI } from '@google/genai';
import slugify from 'slugify';
import { connectDB } from '@/lib/db';
import BlogPost, { IBlogPost } from '@/models/BlogPost';
import { postBlogToFacebook, FacebookPostResult } from '@/lib/facebook-poster';
import { mirrorImageToR2 } from '@/lib/r2';

// Diverse topic themes covering all user-requested domains
export const TOPIC_THEMES = [
  {
    theme: 'AI & Next-Gen Tech',
    category: 'AI & Machine Learning',
    prompts: [
      'Building practical AI tools with Google Gemini 3.8 Flash in Next.js',
      'The rise of AI Agents in Web Development: What Every Developer Needs to Know',
      'Prompt Engineering for Software Engineers: Practical Techniques & Best Practices',
      'How to add AI-Powered Search and Chat to your Fullstack App',
      'Local AI vs Cloud APIs: Running models locally with Ollama and integrating with web apps',
    ],
    coverKeyword: 'artificial-intelligence',
  },
  {
    theme: 'Modern JavaScript & TypeScript',
    category: 'TypeScript & JavaScript',
    prompts: [
      'Top Modern JavaScript Features You Should Be Using Today (ES2024 & Beyond)',
      'TypeScript Pro Tips: Mastering Advanced Generics and Conditional Types',
      'TypeScript Satisfies Operator vs Type Annotations: When and Why to Use It',
      'JavaScript Memory Leaks: How to Diagnose, Prevent, and Fix Them in Modern SPAs',
      'Understanding the JavaScript Event Loop and Microtasks with Real Visual Examples',
    ],
    coverKeyword: 'programming-code',
  },
  {
    theme: 'HTML5 & Modern Web Standards',
    category: 'Web Standards & HTML',
    prompts: [
      'Modern HTML5 Features You Might Not Know About (Dialog, Popover, Inert & More)',
      'Semantic HTML and Modern Web Accessibility (a11y): A Practical Developer Checklist',
      'The Modern Popover API in Native HTML: Building Tooltips and Modals Without JS Libraries',
      'Optimizing Web Performance & Core Web Vitals for Frontend Applications',
    ],
    coverKeyword: 'web-design',
  },
  {
    theme: 'Practical Developer Tutorials',
    category: 'Tutorials & How-To',
    prompts: [
      'Step-by-Step Tutorial: Building a High-Performance Full-Stack App with Next.js and MongoDB',
      'How to Create Fluid, Eye-Catching Micro-Animations with Framer Motion in React',
      'Building Custom Reusable React Hooks for Modern State & Event Management',
      'How to Automate Cross-Platform Social Media Updates for Your Tech Blog or Portfolio',
      'How to Build a Custom Component Library: Lessons Learned from Creating Aspect UI',
    ],
    coverKeyword: 'software-developer',
  },
  {
    theme: 'Free Developer Resources & Tools',
    category: 'Free Tools & Resources',
    prompts: [
      'Top Free APIs and Developer Tools Every Programmer Should Bookmark This Year',
      'The Ultimate Free Cloud & Database Tiers for Side Projects in 2026',
      'Best Open-Source React UI Libraries and Component Collections for Fast Prototyping',
      'Free Developer Productivity Boosters: CLI Tools, Extensions, and Online Utilities',
    ],
    coverKeyword: 'workspace-tech',
  },
];

// Curated high quality tech banners from Unsplash (reliable, direct CDN URLs)
const CURATED_COVERS: Record<string, string[]> = {
  'AI & Machine Learning': [
    'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  ],
  'TypeScript & JavaScript': [
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
  ],
  'Web Standards & HTML': [
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
  ],
  'Tutorials & How-To': [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
  ],
  'Free Tools & Resources': [
    'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=1200&q=80',
  ],
  default: [
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
  ],
};

function pickCoverImage(category: string): string {
  const list = CURATED_COVERS[category] || CURATED_COVERS.default;
  return list[Math.floor(Math.random() * list.length)];
}

/**
 * Attempts to generate an AI cover image using Google Gemini Image Generation model
 * (requires billing-enabled Google Cloud / Gemini Pro API key).
 * Automatically falls back to high-resolution curated tech covers if unavailable or quota-limited.
 */
async function getBlogCoverImage(
  ai: GoogleGenAI,
  title: string,
  category: string
): Promise<string> {
  const enableAiImage = process.env.ENABLE_AI_IMAGE === 'true' || process.env.GEMINI_IMAGE_GEN === 'true';

  if (enableAiImage) {
    try {
      const imageModel = process.env.GEMINI_IMAGE_MODEL || 'gemini-2.5-flash-image';
      const prompt = `A clean, modern, professional web tech header graphic for an article about "${title}". Dark theme, neon accents, minimalist aesthetic, 16:9 banner without text.`;

      const response = await ai.models.generateContent({
        model: imageModel,
        contents: prompt,
      });

      // Check if image data or url is returned in candidate parts
      const part = response.candidates?.[0]?.content?.parts?.[0] as any;
      if (part?.inlineData?.data) {
        // Returned base64 data url
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    } catch (imageErr: any) {
      console.warn('⚠️ AI image generation skipped or quota limited, using curated tech cover:', imageErr?.message || imageErr);
    }
  }

  return pickCoverImage(category);
}

export interface GenerateBlogOptions {
  customTopic?: string;
  category?: string;
  postToFacebook?: boolean;
}

export interface GeneratedBlogResponse {
  blog: IBlogPost;
  facebookResult?: FacebookPostResult;
}

export async function generateDailyBlogPost(
  options: GenerateBlogOptions = {}
): Promise<GeneratedBlogResponse> {
  await connectDB();

  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.APIKEY;
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables');
  }

  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  // Select topic
  let selectedTheme = TOPIC_THEMES[Math.floor(Math.random() * TOPIC_THEMES.length)];
  let selectedPrompt = selectedTheme.prompts[Math.floor(Math.random() * selectedTheme.prompts.length)];

  if (options.customTopic) {
    selectedPrompt = options.customTopic;
    if (options.category) {
      selectedTheme = {
        theme: options.category,
        category: options.category,
        prompts: [options.customTopic],
        coverKeyword: 'technology',
      };
    }
  }

  // Get recent blog titles to avoid repetitive subjects
  const recentBlogs = await BlogPost.find({})
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title slug')
    .lean();

  const existingTitles = recentBlogs.map((b: any) => b.title).join(' | ');

  const prompt = `
You are a senior full-stack software engineer and tech author writing a high-quality, practical tech blog article for Nafis Mahmud Ayon's developer portfolio (nafisbd.com).
The author is Nafis Mahmud Ayon, a frontend & fullstack engineer who loves React, Next.js, TypeScript, UI architecture, and modern web development.

TARGET TOPIC: "${selectedPrompt}"
CATEGORY: "${selectedTheme.category}"

PREVIOUS RECENT ARTICLES (DO NOT DUPLICATE THESE):
${existingTitles || 'None yet'}

REQUIREMENTS:
1. Provide a clear, catchy, professional, SEO-friendly TITLE (do not use generic clickbait, make it concrete).
2. EXCERPT: A compelling 2-sentence summary (max 180 chars) for social cards and previews.
3. CONTENT: A comprehensive, engaging Markdown article (approx 700-1100 words).
   - Use structured Markdown headers (##, ###).
   - Include realistic, working, syntax-highlighted code snippets (\`\`\`typescript, \`\`\`javascript, or \`\`\`html) with line-by-line clarity.
   - Include real-world benefits, caveats/pitfalls to watch out for, and a "Pro Tip" blockquote.
   - Conclude with actionable takeaways and a welcoming closing thought.
4. TAGS: 4-6 relevant tech tags (e.g., ["TypeScript", "JavaScript", "WebDev", "Frontend", "Next.js"]).
5. READ_TIME: Estimated reading time (e.g., "5 min read").

RESPOND ONLY WITH A VALID JSON OBJECT (no markdown wrap, no backticks outside JSON):
{
  "title": "string",
  "excerpt": "string",
  "category": "string",
  "tags": ["string"],
  "readTime": "string",
  "content": "string"
}
`;

  const response = await ai.models.generateContent({
    model: geminiModel,
    contents: prompt,
    config: {
      temperature: 0.75,
      responseMimeType: 'application/json',
    },
  });

  const rawText = response.text?.trim() || '{}';
  let parsed: any;
  try {
    parsed = JSON.parse(rawText);
  } catch (parseErr) {
    // Fallback regex cleaning if wrapped in markdown block
    const cleaned = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    parsed = JSON.parse(cleaned);
  }

  if (!parsed.title || !parsed.content) {
    throw new Error('Gemini failed to generate required blog fields');
  }

  // Create clean unique slug
  let baseSlug = slugify(parsed.title, { lower: true, strict: true });
  if (!baseSlug) baseSlug = `post-${Date.now()}`;

  let finalSlug = baseSlug;
  let counter = 1;
  while (await BlogPost.exists({ slug: finalSlug })) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const initialCover = await getBlogCoverImage(ai, parsed.title, parsed.category || selectedTheme.category);
  // Upload and serve via Cloudflare R2 CDN storage
  const coverImage = await mirrorImageToR2(initialCover, finalSlug);

  // Save to MongoDB
  const blog = await BlogPost.create({
    title: parsed.title,
    slug: finalSlug,
    excerpt: parsed.excerpt || `A deep dive into ${parsed.title}`,
    content: parsed.content,
    coverImage,
    category: parsed.category || selectedTheme.category,
    tags: Array.isArray(parsed.tags) ? parsed.tags : ['Tech', 'WebDev'],
    author: 'Nafis Mahmud Ayon',
    authorRole: 'Frontend & Fullstack Developer',
    authorImage: '/nafis-mahmud-ayon.png',
    readTime: parsed.readTime || '5 min read',
    isPublished: true,
    publishedAt: new Date(),
    aiGenerated: true,
    aiModel: geminiModel,
  });

  let facebookResult: FacebookPostResult | undefined = undefined;

  // Post to Facebook if enabled (default true)
  const shouldPostFB = options.postToFacebook !== false;
  if (shouldPostFB) {
    facebookResult = await postBlogToFacebook(blog);
  }

  return {
    blog,
    facebookResult,
  };
}
