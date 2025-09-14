# Cached Server Actions - Hope International

This document lists all cached server actions in the Hope International application using React cache.

## Overview

All cached server actions use React's built-in `cache` function for request deduplication within a single render cycle. This ensures that the same function called multiple times with the same parameters will only execute once per render.

## Public Server Actions

### Courses (`lib/server-actions/public/courses.ts`)
- `getCachedNewCourses` - Recently added courses
- `getCachedRelatedCourses` - Related courses for a specific course
- `getCachedPublicCourses` - Public course listings with pagination
- `getCachedPublicCourseById` - Single course by ID
- `getCachedPublicCourseBySlug` - Single course by slug

### Course Categories (`lib/server-actions/public/courses-categories.ts`)
- `getCachedPublicAllCategories` - All course categories

### Intakes (`lib/server-actions/public/intakes.ts`)
- `getCachedAllIntakes` - All intakes
- `getCachedIntakeById` - Single intake by ID
- `getCachedCourseIntakesBySlug` - Intakes for a specific course by slug
- `getCachedUpcomingIntakes` - Upcoming intakes
- `getCachedCourseActiveIntakes` - Active intakes for a specific course

## User Server Actions

### Enrollments (`lib/server-actions/user/enrollments.ts`)
- `getCachedUserEnrollments` - User's enrollment history

## Admin Server Actions

### Courses (`lib/server-actions/admin/courses.ts`)
- `cachedAdminCourseList` - Admin course list with pagination
- `cachedAdminCourseListAll` - All courses for admin
- `cachedAdminCourseDetailsById` - Course details by ID

### Course Categories (`lib/server-actions/admin/courses-categories.ts`)
- `cachedAdminCourseCategoryListAll` - All course categories for admin
- `cachedAdminCourseCategoryList` - Course categories with pagination
- `cachedAdminCourseCategoryDetailsById` - Category details by ID

### Enrollments (`lib/server-actions/admin/enrollments.ts`)
- `cachedAdminEnrollmentList` - Admin enrollment list with pagination
- `cachedAdminEnrollmentDetailsById` - Enrollment details by ID
- `cachedAdminEnrollmentDetailsWithJoinsById` - Enrollment with related data
- `cachedAdminEnrollmentListByUserId` - Enrollments for a specific user
- `cachedAdminEnrollmentDetailsWithPaymentById` - Enrollment with payment info
- `cachedAdminEnrollmentListAll` - All enrollments for admin
- `cachedAdminEnrollmentListAllByStatus` - Enrollments filtered by status

### Intakes (`lib/server-actions/admin/intakes.ts`)
- `cachedAdminIntakeList` - Admin intake list with pagination
- `cachedAdminIntakeListAll` - All intakes for admin
- `cachedAdminIntakeDetailsById` - Intake details by ID
- `cachedAdminIntakeListAllActive` - All active intakes

### Payments (`lib/server-actions/admin/payments.ts`)
- `cachedAdminPaymentList` - Admin payment list
- `cachedAdminPaymentDetailsByEnrollmentId` - Payment details by enrollment
- `cachedAdminPaymentDetailsById` - Payment details by ID
- `cachedAdminPaymentDetailsWithRelationsById` - Payment with related data

## Usage Guidelines

### How to Use Cached Server Actions

```typescript
// In server components or server actions
import { getCachedPublicCourses } from '@/lib/server-actions/public/courses';

// Multiple calls with same parameters return cached result
const courses1 = await getCachedPublicCourses({ page: 1, pageSize: 10 });
const courses2 = await getCachedPublicCourses({ page: 1, pageSize: 10 }); // Cached
```

### When to Use Cached Versions

- ✅ In server components that might call the same function multiple times
- ✅ When generating metadata that uses the same data as the page
- ✅ In layouts that share data with child components
- ✅ When multiple components need the same data in one render

### When to Use Original Functions

- ✅ In server actions that modify data (mutations)
- ✅ When you need fresh data every time
- ✅ In API routes (though caching can still be beneficial)
- ✅ When the function has side effects

## Implementation Pattern

All cached server actions follow this pattern:

```typescript
// Original server action
export async function getPublicCourses(params: CourseParams) {
  // Database query logic
  return await db.select().from(courses);
}

// Cached version
export const getCachedPublicCourses = cache(getPublicCourses);
```

## Benefits

### Performance Improvements
- **Eliminates duplicate database calls** within the same render
- **Faster page loads** when multiple components need the same data
- **Reduced server load** from redundant queries
- **Better user experience** with faster response times

### Example Scenario
```typescript
// Without cache - 3 database calls
const courses1 = await getPublicCourses({ page: 1 });
const courses2 = await getPublicCourses({ page: 1 }); 
const courses3 = await getPublicCourses({ page: 1 });

// With cache - 1 database call
const courses1 = await getCachedPublicCourses({ page: 1 });
const courses2 = await getCachedPublicCourses({ page: 1 }); // Cached
const courses3 = await getCachedPublicCourses({ page: 1 }); // Cached
```

## Cache Behavior

### Automatic Management
- **Scope**: Single render cycle only
- **Invalidation**: Automatic after render completes
- **Memory**: Automatically cleaned up
- **Configuration**: None required

### Parameter Sensitivity
Cache is based on function parameters, so:
```typescript
getCachedCourses({ page: 1 }); // Cache miss
getCachedCourses({ page: 1 }); // Cache hit
getCachedCourses({ page: 2 }); // Cache miss (different parameters)
```

## Maintenance

### Adding New Cached Functions
1. Create the original server action
2. Add cached version using React cache
3. Export both versions
4. Update this documentation

### Naming Convention
- **Public functions**: `getCached[FunctionName]`
- **Admin functions**: `cached[FunctionName]`
- Keep original function names unchanged

---

**Last Updated**: August 2024  
**Version**: 1.0 (Simplified)  
**Maintainer**: Hope International Development Team
