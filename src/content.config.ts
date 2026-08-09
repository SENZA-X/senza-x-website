import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 站点设置集合：首页所有可编辑文本和图片，按语言分文件（en.md / zh.md）
const settings = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/settings' }),
  schema: z.object({
    locale: z.enum(['en', 'zh']),
    brand: z.string(),
    nav: z.object({
      about: z.string(),
      products: z.string(),
      craft: z.string(),
      platform: z.string(),
      contact: z.string(),
    }),
    hero: z.object({
      logoText: z.string(),
      mainImage: z.string(),
    }),
    manifesto: z.object({
      eyebrow: z.string(),
      title: z.string(),
      body: z.string(),
      ctaLabel: z.string(),
    }),
    models: z.object({
      eyebrow: z.string(),
      title: z.string(),
      tabs: z.array(z.string()),
      mainImage: z.string(),
      specs: z.array(z.object({ num: z.string(), lbl: z.string() })),
    }),
    mission: z.object({
      eyebrow: z.string(),
      title: z.string(),
      body: z.string(),
      linkLabel: z.string(),
      image: z.string(),
    }),
    dark: z.object({
      eyebrow: z.string(),
      title: z.string(),
      body: z.string(),
      ctaLabel: z.string(),
      bgImage: z.string(),
    }),
    cards: z.array(
      z.object({
        image: z.string(),
        title: z.string(),
        body: z.string(),
        linkLabel: z.string(),
      })
    ),
    news: z.object({
      eyebrow: z.string(),
      title: z.string(),
      body: z.string(),
      ctaLabel: z.string(),
      images: z.array(z.string()),
    }),
    cta: z.object({
      title: z.string(),
      body: z.string(),
      image: z.string(),
      nameLabel: z.string(),
      emailLabel: z.string(),
      companyLabel: z.string(),
      messageLabel: z.string(),
      submitLabel: z.string(),
    }),
    contact: z.object({
      whatsapp: z.string(),
      email: z.string(),
      wechatId: z.string(),
      wechatQr: z.string(),
    }),
    footer: z.object({
      brandDesc: z.string(),
      rights: z.string(),
      location: z.string(),
    }),
  }),
});

// 博客集合：按语言分文件夹（en/、zh/）
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    locale: z.enum(['en', 'zh']),
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    cover: z.string(),
    draft: z.boolean().default(false),
  }),
});

// 案例库集合：按语言分文件夹（en/、zh/）
const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    locale: z.enum(['en', 'zh']),
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    cover: z.string(),
    client: z.string().optional(),
    location: z.string().optional(),
    materials: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { settings, blog, cases };
