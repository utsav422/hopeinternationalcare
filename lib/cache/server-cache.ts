// Next.js 15 Server-side caching utilities using unstable_cache
import { unstable_cache } from 'next/cache';

// Cache configuration constants
export const CACHE_TAGS = {
  courses: 'courses',
  categories: 'categories', 
  intakes: 'intakes',
  enrollments: 'enrollments',
  users: 'users',
  payments: 'payments',
} as const;

export const CACHE_DURATIONS = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 900, // 15 minutes
  veryLong: 3600, // 1 hour
} as const;

// Generic cache wrapper function
export function createCachedFunction<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  tags: string[],
  revalidate: number = CACHE_DURATIONS.medium
): T {
  return unstable_cache(
    fn,
    [keyPrefix],
    {
      tags,
      revalidate,
    }
  ) as T;
}

// Specific cache functions for different data types
export const createCourseCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  revalidate: number = CACHE_DURATIONS.medium
) => createCachedFunction(fn, `course-${keyPrefix}`, [CACHE_TAGS.courses], revalidate);

export const createCategoryCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  revalidate: number = CACHE_DURATIONS.long
) => createCachedFunction(fn, `category-${keyPrefix}`, [CACHE_TAGS.categories], revalidate);

export const createIntakeCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  revalidate: number = CACHE_DURATIONS.short
) => createCachedFunction(fn, `intake-${keyPrefix}`, [CACHE_TAGS.intakes], revalidate);

export const createEnrollmentCache = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  keyPrefix: string,
  revalidate: number = CACHE_DURATIONS.short
) => createCachedFunction(fn, `enrollment-${keyPrefix}`, [CACHE_TAGS.enrollments], revalidate);

// Cache invalidation helpers
export const invalidateCache = {
  courses: () => [CACHE_TAGS.courses],
  categories: () => [CACHE_TAGS.categories],
  intakes: () => [CACHE_TAGS.intakes],
  enrollments: () => [CACHE_TAGS.enrollments],
  all: () => Object.values(CACHE_TAGS),
};
