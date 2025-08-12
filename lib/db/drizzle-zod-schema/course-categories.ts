import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { courseCategories } from '../schema/course-categories';
export const ZodCourseCategoryInsertSchema = createInsertSchema(
  courseCategories,
  {
    name: (schema) =>
      schema.min(3, { message: 'Title must be at least 3 characters long' }),
    description: (schema) =>
      schema
        .max(500, { message: 'Description cannot exceed 500 characters' })
        .optional(),
  }
);

export const ZodCourseCategorySelectSchema =
  createSelectSchema(courseCategories);
// Infer Typescript type for convenience.
export type ZodInsertCourseCategoryType =
  typeof ZodCourseCategoryInsertSchema._zod.input;
export type ZodSelectCourseCategoryType =
  typeof ZodCourseCategorySelectSchema._zod.input;
