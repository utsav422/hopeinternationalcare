# Cached Server Actions Implementation Guide

This guide demonstrates how to implement and use cached server actions in server components throughout the Hope International application.

## Overview

React's `cache` function provides request-level memoization for server-side functions, ensuring that identical function calls within the same render cycle return cached results instead of executing multiple database queries.

## Implementation Pattern

### 1. Basic Implementation

```typescript
// lib/server-actions/example.ts
'use server';

import { cache } from 'react';
import { db } from '@/lib/db/drizzle';

// Original server action
export async function getExampleData(id: string) {
  return await db.query.examples.findFirst({
    where: (examples, { eq }) => eq(examples.id, id)
  });
}

// Cached version
export const getCachedExampleData = cache(getExampleData);
```

### 2. Server Component Usage

```typescript
// app/example/page.tsx
import { getCachedExampleData } from '@/lib/server-actions/example';

export default async function ExamplePage() {
  // These calls will be deduplicated within the same render
  const data1 = await getCachedExampleData('123');
  const data2 = await getCachedExampleData('123'); // Cached result
  const data3 = await getCachedExampleData('456'); // New query
  
  return (
    <div>
      <h1>Example Page</h1>
      {/* Render data */}
    </div>
  );
}
```

## Real-World Examples

### 1. Course Details Page

```typescript
// app/courses/[slug]/page.tsx
import { getCachedPublicCourseBySlug, getCachedRelatedCourses } from '@/lib/server-actions/public/courses';
import { getCachedCourseActiveIntakes } from '@/lib/server-actions/public/intakes';

export default async function CourseDetailsPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  
  // All these calls are cached within the same render
  const courseResult = await getCachedPublicCourseBySlug(slug);
  const intakesResult = await getCachedCourseActiveIntakes(courseResult.data?.id || '');
  const relatedResult = await getCachedRelatedCourses(courseResult.data?.id || '');
  
  if (!courseResult.success) {
    notFound();
  }
  
  return (
    <div>
      <CourseDetails course={courseResult.data} />
      <CourseIntakes intakes={intakesResult.data} />
      <RelatedCourses courses={relatedResult.data} />
    </div>
  );
}
```

### 2. Admin Dashboard

```typescript
// app/(protected)/admin/dashboard/page.tsx
import { 
  cachedAdminDashboardEnrollmentsByStatus,
  cachedAdminDashboardTotalIncome,
  cachedAdminDashboardPaymentsByStatus 
} from '@/lib/server-actions/admin/dashboard';

export default async function AdminDashboard() {
  // Multiple dashboard metrics cached efficiently
  const enrollmentStats = await cachedAdminDashboardEnrollmentsByStatus();
  const incomeStats = await cachedAdminDashboardTotalIncome();
  const paymentStats = await cachedAdminDashboardPaymentsByStatus();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <EnrollmentStatsCard data={enrollmentStats.data} />
      <IncomeStatsCard data={incomeStats.data} />
      <PaymentStatsCard data={paymentStats.data} />
    </div>
  );
}
```

### 3. Metadata Generation

```typescript
// app/courses/[slug]/page.tsx
import { getCachedPublicCourseBySlug } from '@/lib/server-actions/public/courses';
import { generateCourseMetadata } from '@/lib/seo/metadata';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // This call is cached and shared with the page component
  const courseResult = await getCachedPublicCourseBySlug(params.slug);
  
  if (!courseResult.success || !courseResult.data) {
    return { title: 'Course Not Found' };
  }
  
  return generateCourseMetadata(courseResult.data);
}

export default async function CourseDetailsPage({ params }: { params: { slug: string } }) {
  // This call returns cached result from generateMetadata
  const courseResult = await getCachedPublicCourseBySlug(params.slug);
  
  // Component implementation...
}
```

## Performance Benefits

### Before Caching
```typescript
// Multiple database calls for the same data
const course1 = await getPublicCourseBySlug('web-development'); // DB Query 1
const course2 = await getPublicCourseBySlug('web-development'); // DB Query 2
const course3 = await getPublicCourseBySlug('web-development'); // DB Query 3
// Total: 3 database queries
```

### After Caching
```typescript
// Single database call with cached results
const course1 = await getCachedPublicCourseBySlug('web-development'); // DB Query 1
const course2 = await getCachedPublicCourseBySlug('web-development'); // Cached
const course3 = await getCachedPublicCourseBySlug('web-development'); // Cached
// Total: 1 database query
```

## Best Practices

### 1. Use Cached Versions in Server Components
```typescript
// ✅ Good - Use cached versions in server components
import { getCachedPublicCourses } from '@/lib/server-actions/public/courses';

export default async function CoursesPage() {
  const courses = await getCachedPublicCourses({ page: 1 });
  return <CourseList courses={courses.data} />;
}
```

### 2. Use Original Functions for Mutations
```typescript
// ✅ Good - Use original functions for data mutations
import { createCourse } from '@/lib/server-actions/admin/courses';

export async function createCourseAction(formData: FormData) {
  // Don't cache mutations
  return await createCourse(formData);
}
```

### 3. Parameter Sensitivity
```typescript
// Different parameters = different cache entries
const page1 = await getCachedPublicCourses({ page: 1 }); // Cache miss
const page1Again = await getCachedPublicCourses({ page: 1 }); // Cache hit
const page2 = await getCachedPublicCourses({ page: 2 }); // Cache miss
```

## Common Patterns

### 1. Layout + Page Data Sharing
```typescript
// app/courses/layout.tsx
import { getCachedPublicAllCategories } from '@/lib/server-actions/public/courses-categories';

export default async function CoursesLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCachedPublicAllCategories();
  
  return (
    <div>
      <CategorySidebar categories={categories.data} />
      {children}
    </div>
  );
}

// app/courses/page.tsx
import { getCachedPublicAllCategories } from '@/lib/server-actions/public/courses-categories';

export default async function CoursesPage() {
  // This returns cached result from layout
  const categories = await getCachedPublicAllCategories();
  
  return <CourseFilters categories={categories.data} />;
}
```

### 2. Parallel Data Fetching
```typescript
export default async function DashboardPage() {
  // All these run in parallel and are cached
  const [enrollments, payments, users] = await Promise.all([
    cachedAdminEnrollmentListAll(),
    cachedAdminPaymentList({ page: 1 }),
    cachedAdminUserListAll()
  ]);
  
  return (
    <div>
      <EnrollmentStats data={enrollments.data} />
      <PaymentStats data={payments.data} />
      <UserStats data={users.data} />
    </div>
  );
}
```

## Cache Scope and Lifecycle

### Request-Level Caching
- Cache is scoped to a single request/render cycle
- Automatically cleared after the request completes
- No manual cache invalidation needed
- Memory is automatically managed

### Parameter-Based Caching
- Cache keys are based on function parameters
- Deep equality comparison for objects
- Different parameters create separate cache entries

## Monitoring and Debugging

### 1. Performance Monitoring
```typescript
// Add timing logs for debugging
export const getCachedDataWithTiming = cache(async (id: string) => {
  const start = Date.now();
  const result = await getData(id);
  console.log(`getData(${id}) took ${Date.now() - start}ms`);
  return result;
});
```

### 2. Cache Hit Tracking
```typescript
let cacheHits = 0;
let cacheMisses = 0;

export const getCachedDataWithStats = cache(async (id: string) => {
  cacheMisses++;
  const result = await getData(id);
  return result;
});

// In development, log cache statistics
if (process.env.NODE_ENV === 'development') {
  console.log(`Cache hits: ${cacheHits}, Cache misses: ${cacheMisses}`);
}
```

## Migration Guide

### Converting Existing Server Actions

1. **Add cache import**:
```typescript
import { cache } from 'react';
```

2. **Create cached version**:
```typescript
export const getCachedFunctionName = cache(originalFunction);
```

3. **Update imports in server components**:
```typescript
// Before
import { getPublicCourses } from '@/lib/server-actions/public/courses';

// After
import { getCachedPublicCourses } from '@/lib/server-actions/public/courses';
```

4. **Update function calls**:
```typescript
// Before
const courses = await getPublicCourses({ page: 1 });

// After
const courses = await getCachedPublicCourses({ page: 1 });
```

## Conclusion

Cached server actions provide significant performance improvements by eliminating duplicate database queries within the same render cycle. They are essential for:

- Server components that might call the same function multiple times
- Metadata generation that shares data with page components
- Layouts that share data with child components
- Dashboard pages with multiple data requirements

The implementation is straightforward and provides automatic performance optimization without changing the function signatures or requiring manual cache management.
