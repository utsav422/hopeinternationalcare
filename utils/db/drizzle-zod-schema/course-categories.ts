import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { courseCategories } from '../schema/course-categories';
export const CategoriesInsertSchema = createInsertSchema(courseCategories, {
  name: (schema) =>
    schema.min(3, { message: 'Title must be at least 3 characters long' }),
  description: (schema) =>
    schema
      .max(500, { message: 'Description cannot exceed 500 characters' })
      .optional(),
});

export const CategoriesSelectSchema = createSelectSchema(courseCategories);
// Infer Typescript type for convenience.
export type ZTInsertCourseCategories = typeof CategoriesInsertSchema._zod.input;
export type ZTSelectCourseCategories = typeof CategoriesSelectSchema._zod.input;
