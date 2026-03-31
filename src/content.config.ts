import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const aboutCollection = defineCollection({
  loader: glob({ base: './src/content', pattern: 'about.md' }),
});

export const collections = {
  about: aboutCollection,
};
