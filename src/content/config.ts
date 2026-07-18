import { defineCollection, z } from 'astro:content';

const team = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    photo: z.string(), // path under /public, e.g. /images/team/jane.jpg
    order: z.number().default(99), // controls display order, lower = first
    email: z.string().optional(),
    website: z.string().optional(),
    orcid: z.string().optional(),
    active: z.boolean().default(true), // false = alumni / past member
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    summary: z.string(), // one or two sentences, shown on the card
    cover: z.string(), // path under /public, e.g. /images/projects/atlas-cover.jpg
    tags: z.array(z.string()).default([]),
    status: z.enum(['ongoing', 'completed']).default('ongoing'),
    year: z.number(),
    gallery: z.array(z.string()).default([]),
    links: z
      .array(z.object({ label: z.string(), url: z.string() }))
      .default([]),
    featured: z.boolean().default(false), // shown larger on homepage/projects page
  }),
});

const publications = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    authors: z.string(), // e.g. "A. Silva, B. Costa, C. Fernandes"
    venue: z.string(), // e.g. "CHI 2026" or "IEEE VIS 2025"
    year: z.number(),
    category: z.enum(['book', 'book-chapter', 'journal-article', 'conference-paper']),
    pdf: z.string().optional(), // path under /public, e.g. /files/paper.pdf
    doi: z.string().optional(),
    project: z.string().optional(), // slug of a related project, optional
  }),
});

export const collections = { team, projects, publications };
