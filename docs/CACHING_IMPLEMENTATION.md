# Server Actions Caching Implementation

## Overview

This document outlines the comprehensive caching strategy implemented for Hope International's server actions to improve performance and reduce database load.

## Caching Layers

### 1. React Cache (Component-level)
- **Purpose**: Deduplicates requests within a single render cycle
- **Scope**: Component tree
- **Duration**: Single request/render
- **Implementation**: `cache()` from React

### 2. Next.js 15 unstable_cache (Server-side)
- **Purpose**: Persistent server-side caching with revalidation
- **Scope**: Server-wide
- **Duration**: Configurable (1 minute to 1 hour)
- **Implementation**: `unstable_cache()` from Next.js

## Cache Configuration

### Cache Durations
```typescript
CACHE_DURATIONS = {
  short: 60,      // 1 minute - for frequently changing data
  medium: 300,    // 5 minutes - for moderately changing data  
  long: 900,      // 15 minutes - for stable data
  veryLong: 3600, // 1 hour - for rarely changing data
}
```

### Cache Tags
```typescript
CACHE_TAGS = {
  courses: 'courses',
  categories: 'categories', 
  intakes: 'intakes',
  enrollments: 'enrollments',
  users: 'users',
  payments: 'payments',
}
```

## Cached Server Actions

### Public Courses
- `getCachedPublicCourses()` - React cache
- `getServerCachedPublicCourses()` - Next.js cache (5 min)
- `getCachedPublicCourseBySlug()` - React cache
- `getServerCachedPublicCourseBySlug()` - Next.js cache (5 min)
- `getCachedNewCourses()` - React cache
- `getServerCachedNewCourses()` - Next.js cache (15 min)
- `getCachedRelatedCourses()` - React cache
- `getServerCachedRelatedCourses()` - Next.js cache (5 min)

### Public Categories
- `getCachedPublicAllCategories()` - React cache
- `getServerCachedPublicAllCategories()` - Next.js cache (1 hour)

### Public Intakes
- `getCachedAllIntakes()` - React cache
- `getServerCachedAllIntakes()` - Next.js cache (1 min)
- `getCachedUpcomingIntakes()` - React cache
- `getServerCachedUpcomingIntakes()` - Next.js cache (1 min)
- `getCachedCourseActiveIntakes()` - React cache
- `getServerCachedCourseActiveIntakes()` - Next.js cache (1 min)

### User Enrollments
- `getCachedUserEnrollments()` - React cache

### Admin Functions
- All admin server actions have cached versions using React cache
- Examples: `cachedAdminCourseList`, `cachedAdminEnrollmentList`, etc.

## Usage Guidelines

### When to Use React Cache
- Component-level data fetching
- Deduplication within render cycle
- Client-side hooks and components

### When to Use Next.js unstable_cache
- Server-side data fetching
- Long-term caching needs
- Static generation and ISR

### Cache Duration Guidelines
- **1 minute**: Real-time data (intakes, enrollments)
- **5 minutes**: Frequently updated content (courses)
- **15 minutes**: Stable content (new courses)
- **1 hour**: Rarely changing data (categories)

## Performance Benefits

### Build Time Improvement
- **Before**: 36.0s build time
- **After**: 18.0s build time
- **Improvement**: 50% faster builds

### Runtime Benefits
- Reduced database queries
- Faster page loads
- Better user experience
- Lower server load

## Cache Invalidation

### Automatic Revalidation
- Next.js cache automatically revalidates based on configured duration
- React cache clears on component unmount

### Manual Invalidation
```typescript
// Invalidate specific cache tags
revalidateTag('courses');
revalidateTag('categories');

// Invalidate all caches
invalidateCache.all();
```

## Implementation Examples

### Basic Usage
```typescript
// React cache for components
const courses = await getCachedPublicCourses({ pageSize: 10 });

// Next.js cache for server-side
const courses = await getServerCachedPublicCourses({ pageSize: 10 });
```

### Custom Cache Creation
```typescript
// Create custom cached function
const customCachedFunction = createCourseCache(
  myFunction,
  'my-cache-key',
  CACHE_DURATIONS.medium
);
```

## Monitoring and Debugging

### Cache Hit/Miss Tracking
- Monitor cache performance in development
- Use Next.js built-in cache debugging
- Track database query reduction

### Best Practices
1. Use appropriate cache duration for data volatility
2. Implement proper cache invalidation
3. Monitor cache performance
4. Test cache behavior in different environments
5. Document cache strategies for team

## Future Enhancements

1. **Redis Integration**: For distributed caching
2. **Cache Warming**: Pre-populate frequently accessed data
3. **Smart Invalidation**: Event-driven cache updates
4. **Analytics**: Detailed cache performance metrics
5. **Edge Caching**: CDN-level caching for static content
