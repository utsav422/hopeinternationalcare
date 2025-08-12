import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { courses } from '@/lib/db/schema/courses';

const MIN_DESCRIPTION_LENGTH = 1;
export const ZodCourseInsertSchema = createInsertSchema(courses, {
  title: (schema) => schema.min(3, 'Title must be at least 3 characters'),
  slug: (schema) =>
    schema
      .min(3, 'Slug must be at least 3 characters')
      .max(50, 'Slug cannot exceed 50 characters'),
  description: (schema) =>
    schema.min(
      MIN_DESCRIPTION_LENGTH,
      `Description needs to exceed more than ${MIN_DESCRIPTION_LENGTH} characters`
    ),
  category_id: (schema) => schema.nonempty('Invalid category'),
  level: (schema) => schema.int().min(1).max(5),
  duration_value: (schema) => schema.int().positive(),
  image_url: (schema) =>
    schema.url({ message: 'Invalid URL format' }).optional(),
});

export const ZodCourseSelectSchema = createSelectSchema(courses);
// Infer Typescript type for convenience.
export type ZodInsertCourseType = typeof ZodCourseInsertSchema._zod.input;
export type ZodSelectCourseType = typeof ZodCourseSelectSchema._zod.input;
