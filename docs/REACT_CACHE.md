# React Cache Implementation - Hope International

This document outlines the simple React cache implementation used in the Hope International website.

## Overview

The application uses React's built-in `cache` function for optimizing server-side data fetching. This provides automatic deduplication of requests within a single render cycle.

## What React Cache Does

- **Deduplicates requests** - Same function calls with same parameters return cached results
- **Single render cycle scope** - Cache is valid only during one render cycle
- **Automatic cleanup** - Cache is cleared after each render
- **Zero configuration** - Works out of the box with no setup required

## Implementation

### Basic Usage

```typescript
import { cache } from 'react';

// Wrap any async function with cache
const getCachedData = cache(async (id: string) => {
  return await fetchDataFromDatabase(id);
});

// Multiple calls with same parameters return cached result
const data1 = await getCachedData('123'); // Database call
const data2 = await getCachedData('123'); // Cached result
```

### Server Actions with Cache

All server actions in the application have cached versions:

```typescript
// Original function
export async function getPublicCourses() {
  return await db.select().from(courses);
}

// Cached version
export const getCachedPublicCourses = cache(getPublicCourses);
```

## Cache Utilities

### Simple Cache Creators

```typescript
// lib/cache/server-cache.ts
export const createCourseCache = <T extends (...args: any[]) => any>(fn: T) => cache(fn);
export const createEnrollmentCache = <T extends (...args: any[]) => any>(fn: T) => cache(fn);
export const createPaymentCache = <T extends (...args: any[]) => any>(fn: T) => cache(fn);
```

### React Cache Wrapper

```typescript
// lib/cache/react-cache.ts
export function createReactCache<T extends (...args: any[]) => any>(fn: T): T {
  return cache(fn);
}
```

## Current Cached Functions

### Public Data
- `getCachedPublicCourses` - Course listings
- `getCachedPublicAllCategories` - Course categories
- `getCachedUpcomingIntakes` - Upcoming course intakes
- `getCachedNewCourses` - Recently added courses

### User Data
- `getCachedUserEnrollments` - User's enrollments
- `getServerCachedUserEnrollments` - Server-cached user enrollments

### Admin Data
- `cachedAdminEnrollmentList` - Admin enrollment list
- `cachedAdminPaymentList` - Admin payment list
- `cachedAdminPaymentDetailsById` - Payment details
- `getServerCachedAdminPaymentList` - Server-cached admin payments

## Benefits

### Performance Improvements
- **Eliminates duplicate database calls** within the same render
- **Faster page loads** when multiple components need the same data
- **Reduced server load** from redundant queries

### Example Scenario
```typescript
// Without cache - 3 database calls
const courses1 = await getPublicCourses();
const courses2 = await getPublicCourses(); 
const courses3 = await getPublicCourses();

// With cache - 1 database call
const courses1 = await getCachedPublicCourses();
const courses2 = await getCachedPublicCourses(); // Cached
const courses3 = await getCachedPublicCourses(); // Cached
```

## Usage Guidelines

### When to Use React Cache
- ✅ Server actions that fetch data
- ✅ Functions called multiple times in one render
- ✅ Expensive database queries
- ✅ API calls to external services

### When NOT to Use React Cache
- ❌ Functions that modify data (mutations)
- ❌ Functions with side effects
- ❌ Functions that should always return fresh data
- ❌ Client-side only functions

## Implementation Examples

### Course Data Caching
```typescript
// lib/server-actions/public/courses.ts
export const getCachedPublicCourses = cache(getPublicCourses);
export const getCachedNewCourses = cache(getNewCourses);
export const getServerCachedPublicCourses = createCourseCache(getPublicCourses);
```

### Enrollment Data Caching
```typescript
// lib/server-actions/user/enrollments.ts
export const getCachedUserEnrollments = cache(getUserEnrollments);
export const getServerCachedUserEnrollments = createEnrollmentCache(getUserEnrollments);
```

### Payment Data Caching
```typescript
// lib/server-actions/admin/payments.ts
export const cachedAdminPaymentList = cache(adminPaymentList);
export const getServerCachedAdminPaymentList = createPaymentCache(adminPaymentList);
```

## Cache Behavior

### Automatic Invalidation
React cache automatically invalidates when:
- Component unmounts
- Page navigation occurs
- New render cycle begins
- Server action completes

### No Manual Management Required
- No cache keys to manage
- No expiration times to set
- No manual invalidation needed
- No memory leaks to worry about

## Best Practices

### 1. Cache Read Operations Only
```typescript
// Good - Read operation
export const getCachedCourses = cache(getCourses);

// Bad - Write operation
export const cachedCreateCourse = cache(createCourse); // Don't do this
```

### 2. Use Descriptive Names
```typescript
// Good
export const getCachedUserEnrollments = cache(getUserEnrollments);

// Less clear
export const cached = cache(getData);
```

### 3. Keep Functions Pure
```typescript
// Good - Pure function
const getCachedData = cache(async (id: string) => {
  return await db.select().from(table).where(eq(table.id, id));
});

// Bad - Side effects
const cachedWithSideEffect = cache(async (id: string) => {
  console.log('Fetching data'); // Side effect
  return await fetchData(id);
});
```

## Troubleshooting

### Common Issues

1. **Cache not working**: Ensure function parameters are identical
2. **Stale data**: React cache only lasts one render cycle
3. **Memory usage**: React cache automatically cleans up

### Debug Tips

```typescript
// Add logging to see cache behavior
const getCachedData = cache(async (id: string) => {
  console.log(`Fetching data for ID: ${id}`);
  return await fetchData(id);
});
```

## Migration from Complex Caching

The application was simplified from a complex caching system to use only React cache:

### Removed Features
- ❌ unstable_cache (Next.js server-side caching)
- ❌ Cache monitoring and metrics
- ❌ Cache invalidation strategies
- ❌ Cache warm-up and preloading
- ❌ Cache management APIs

### Kept Features
- ✅ React cache for deduplication
- ✅ Simple cache creator utilities
- ✅ Cached versions of server actions

## Conclusion

The simplified React cache implementation provides:
- **Better performance** through request deduplication
- **Simpler codebase** with less complexity
- **Automatic management** with no configuration needed
- **Reliable behavior** with built-in cleanup

This approach focuses on the core benefit of caching (eliminating duplicate requests) while avoiding the complexity of advanced caching strategies.

---

**Last Updated**: August 2024  
**Version**: 1.0 (Simplified)  
**Maintainer**: Hope International Development Team
