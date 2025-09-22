# Enrollment Hooks Documentation

This document explains how to use the new enrollment React hooks.

## Overview

The enrollment hooks provide a standardized way to fetch and mutate enrollment data in the admin panel. They are built on top of React Query for efficient caching and state management.

## Available Hooks

### Query Hooks

#### `useAdminEnrollmentList`
Fetches a paginated list of enrollments with filtering and sorting capabilities.

```typescript
import { useAdminEnrollmentList } from '@/hooks/admin/enrollments';

const { data, isLoading, error } = useAdminEnrollmentList({
  page: 1,
  pageSize: 10,
  filters: [{ id: 'status', value: 'enrolled' }]
});
```

#### `useAdminEnrollmentDetails`
Fetches detailed information about a specific enrollment.

```typescript
import { useAdminEnrollmentDetails } from '@/hooks/admin/enrollments';

const { data, isLoading, error } = useAdminEnrollmentDetails('enrollment-id');
```

#### `useAdminEnrollmentListByStatus`
Fetches enrollments filtered by a specific status.

```typescript
import { useAdminEnrollmentListByStatus } from '@/hooks/admin/enrollments';

const { data, isLoading, error } = useAdminEnrollmentListByStatus('enrolled');
```

#### `useAdminEnrollmentListByUserId`
Fetches enrollments for a specific user.

```typescript
import { useAdminEnrollmentListByUserId } from '@/hooks/admin/enrollments';

const { data, isLoading, error } = useAdminEnrollmentListByUserId('user-id');
```

### Mutation Hooks

#### `useAdminEnrollmentCreate`
Creates a new enrollment.

```typescript
import { useAdminEnrollmentCreate } from '@/hooks/admin/enrollments';

const mutation = useAdminEnrollmentCreate();

const handleCreate = () => {
  mutation.mutate({
    user_id: 'user-id',
    intake_id: 'intake-id',
    status: 'requested',
    notes: 'optional notes'
  });
};
```

#### `useAdminEnrollmentUpdate`
Updates an existing enrollment.

```typescript
import { useAdminEnrollmentUpdate } from '@/hooks/admin/enrollments';

const mutation = useAdminEnrollmentUpdate();

const handleUpdate = () => {
  mutation.mutate({
    id: 'enrollment-id',
    data: {
      status: 'enrolled',
      notes: 'updated notes'
    }
  });
};
```

#### `useAdminEnrollmentUpdateStatus`
Updates the status of an enrollment.

```typescript
import { useAdminEnrollmentUpdateStatus } from '@/hooks/admin/enrollments';

const mutation = useAdminEnrollmentUpdateStatus();

const handleStatusUpdate = () => {
  mutation.mutate({
    id: 'enrollment-id',
    status: 'completed',
    cancelled_reason: 'optional reason',
    notify_user: true
  });
};
```

#### `useAdminEnrollmentBulkStatusUpdate`
Updates the status of multiple enrollments at once.

```typescript
import { useAdminEnrollmentBulkStatusUpdate } from '@/hooks/admin/enrollments';

const mutation = useAdminEnrollmentBulkStatusUpdate();

const handleBulkUpdate = () => {
  mutation.mutate({
    ids: ['id1', 'id2', 'id3'],
    status: 'completed',
    cancelled_reason: 'optional reason'
  });
};
```

#### `useAdminEnrollmentDelete`
Deletes an enrollment.

```typescript
import { useAdminEnrollmentDelete } from '@/hooks/admin/enrollments';

const mutation = useAdminEnrollmentDelete();

const handleDelete = () => {
  mutation.mutate('enrollment-id');
};
```

## Error Handling

All hooks provide consistent error handling:

```typescript
const { data, isLoading, error } = useAdminEnrollmentList(params);

if (error) {
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  if (error.details) {
    console.error('Error details:', error.details);
  }
}
```

## Caching

The hooks use React Query's caching mechanism for optimal performance:

- List queries are cached for 5 minutes
- Detail queries are cached for 5 minutes
- Cache is automatically invalidated after mutations
- Garbage collection occurs after 1 hour of inactivity

## Best Practices

1. Always handle loading and error states in your components
2. Use the appropriate hook for your use case
3. Take advantage of the built-in caching
4. Follow the type definitions for correct data structures
5. Handle errors gracefully with user-friendly messages