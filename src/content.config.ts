import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const aboutCollection = defineCollection({
  loader: glob({ base: './src/content', pattern: 'about.md' }),
});

const projectsCollection = defineCollection({
  loader: glob({ base: './src/content/projects', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    github: z.string().url().optional(),
  })
});

const gardenCollection = defineCollection({
  loader: glob({ base: './src/content/garden', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
  })
});

export const collections = {
  about: aboutCollection,
  projects: projectsCollection,
  garden: gardenCollection,
};
