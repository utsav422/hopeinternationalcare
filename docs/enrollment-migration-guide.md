# Enrollment System Migration Guide

This guide explains how to migrate from the old enrollment server actions to the new optimized implementation.

## Overview

The enrollment system has been completely refactored to improve performance, maintainability, and developer experience. The new implementation features:

1. Centralized type definitions
2. Optimized database queries
3. Standardized error handling
4. Separated business logic
5. Improved validation
6. Better caching strategies

## Migration Path

### 1. Update Imports

**Old imports:**
```typescript
import { 
  adminEnrollmentList, 
  adminEnrollmentDetailsById,
  adminEnrollmentUpsert,
  adminEnrollmentUpdateStatusById,
  adminEnrollmentDeleteById
} from '@/lib/server-actions/admin/enrollments';
```

**New imports (recommended):**
```typescript
import { 
  adminEnrollmentList, 
  adminEnrollmentDetails,
  adminEnrollmentCreate,
  adminEnrollmentUpdate,
  adminEnrollmentUpdateStatus,
  adminEnrollmentDelete
} from '@/lib/server-actions/admin/enrollments-optimized';
```

**Compatibility imports (for existing code):**
```typescript
import { 
  adminEnrollmentListCompat as adminEnrollmentList, 
  adminEnrollmentDetailsById,
  adminEnrollmentUpsert,
  adminEnrollmentUpdateStatusById,
  adminEnrollmentDeleteById
} from '@/lib/server-actions/admin/enrollments-compat';
```

### 2. Update Function Calls

#### Listing Enrollments

**Old:**
```typescript
const result = await adminEnrollmentList({
  page: 1,
  pageSize: 10,
  filters: []
});
```

**New:**
```typescript
const result = await adminEnrollmentList({
  page: 1,
  pageSize: 10,
  filters: []
});
// Response format has changed - see below
```

#### Getting Enrollment Details

**Old:**
```typescript
const result = await adminEnrollmentDetailsById(id);
```

**New:**
```typescript
const result = await adminEnrollmentDetails(id);
// Response format has changed - see below
```

#### Creating/Updating Enrollments

**Old:**
```typescript
const result = await adminEnrollmentUpsert(enrollmentData);
```

**New:**
```typescript
// For creation
const result = await adminEnrollmentCreate({
  user_id: 'user-id',
  intake_id: 'intake-id',
  status: 'requested',
  notes: 'optional notes'
});

// For updates
const result = await adminEnrollmentUpdate(id, {
  status: 'enrolled',
  notes: 'updated notes'
});
```

#### Updating Enrollment Status

**Old:**
```typescript
const result = await adminEnrollmentUpdateStatusById(id, 'enrolled', 'optional reason');
```

**New:**
```typescript
const result = await adminEnrollmentUpdateStatus({
  id: 'enrollment-id',
  status: 'enrolled',
  cancelled_reason: 'optional reason',
  notify_user: true // Optional, defaults to true
});
```

#### Deleting Enrollments

**Old:**
```typescript
const result = await adminEnrollmentDeleteById(id);
```

**New:**
```typescript
const result = await adminEnrollmentDelete(id);
```

### 3. Update Response Handling

#### Old Response Format:
```typescript
// Success
{
  success: true,
  data: {...},
  total?: number // for lists
}

// Error
{
  success: false,
  error: 'Error message'
}
```

#### New Response Format:
```typescript
// Success
{
  success: true,
  data: {...},
  message?: string
}

// Error
{
  success: false,
  error: 'Error message',
  code: 'ERROR_CODE',
  details?: {...}
}
```

### 4. Update Hook Usage

**Old hooks:**
```typescript
import { 
  useAdminEnrollmentList, 
  useAdminEnrollmentDetailsById,
  useAdminEnrollmentUpsert,
  useAdminEnrollmentUpdateStatus,
  useAdminEnrollmentDelete
} from '@/hooks/admin/enrollments';
```

**New hooks:**
```typescript
import { 
  useAdminEnrollmentList, 
  useAdminEnrollmentDetails,
  useAdminEnrollmentCreate,
  useAdminEnrollmentUpdate,
  useAdminEnrollmentUpdateStatus,
  useAdminEnrollmentDelete
} from '@/hooks/admin/enrollments';
```

## Type Definitions

The new system uses centralized TypeScript types:

```typescript
import type { 
  EnrollmentBase, 
  EnrollmentWithDetails, 
  EnrollmentListItem,
  EnrollmentQueryParams,
  EnrollmentStatusUpdate,
  EnrollmentCreateData
} from '@/lib/types/enrollments';
```

## Error Handling

The new system provides standardized error responses:

```typescript
try {
  const result = await adminEnrollmentCreate(data);
  if (!result.success) {
    console.error('Error code:', result.code);
    console.error('Error message:', result.error);
    if (result.details) {
      console.error('Error details:', result.details);
    }
  }
} catch (error) {
  // Handle unexpected errors
}
```

## Testing

All new functions include comprehensive error handling and validation. Make sure to test:

1. Success cases
2. Validation errors
3. Database errors
4. Business logic violations
5. Edge cases

## Deprecation Timeline

- Current version: Full backward compatibility
- Next minor version: Deprecation warnings
- Future major version: Removal of old implementation

## Support

For migration assistance, contact the development team or refer to the examples in the codebase.