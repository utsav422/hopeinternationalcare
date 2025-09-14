# User Deletion Management Routes

This document outlines all the routes and navigation structure for the user deletion management system.

## Route Structure

### Admin User Management Routes

#### Main Users Page
- **Route**: `/admin/users`
- **Component**: `app/(protected)/admin/users/page.tsx`
- **Description**: Main users management page with active users table
- **Features**:
  - User listing with pagination
  - Search and filtering
  - User invitation
  - Delete user action (opens modal)
  - Navigation to deleted users

#### Deleted Users Page
- **Route**: `/admin/users/deleted`
- **Component**: `app/(protected)/admin/users/deleted/page.tsx`
- **Description**: Comprehensive deleted users management page
- **Features**:
  - Deleted users listing with pagination
  - Search and filtering by deletion date, admin, etc.
  - Statistics dashboard
  - Restore user functionality
  - View deletion history
  - Status indicators (deleted vs scheduled)

#### User Deletion History
- **Route**: `/admin/users/deleted/[id]/history`
- **Component**: `app/(protected)/admin/users/deleted/[id]/history/page.tsx`
- **Description**: Detailed deletion and restoration history for a specific user
- **Features**:
  - Timeline view of all deletion/restoration events
  - Admin action tracking
  - Email notification status
  - Restoration count tracking
  - Breadcrumb navigation

### Layout and Navigation

#### Users Layout
- **File**: `app/(protected)/admin/users/layout.tsx`
- **Description**: Shared layout for all user management pages
- **Features**:
  - Consistent metadata
  - Container styling
  - SEO optimization

#### Navigation Components
- **Breadcrumb**: `components/Admin/Users/user-management-breadcrumb.tsx`
- **Quick Navigation**: `components/Admin/Users/user-management-breadcrumb.tsx`
- **Sidebar Integration**: Updated `components/Admin/Sidebar/app-sidebar.tsx`

### Loading and Error States

#### Loading Pages
- `/admin/users/deleted/loading.tsx` - Deleted users page skeleton
- `/admin/users/deleted/[id]/loading.tsx` - History page skeleton

#### Error Pages
- `/admin/users/deleted/[id]/not-found.tsx` - User not found page

## Navigation Structure

### Sidebar Navigation
```
General
├── Dashboard (/admin)
├── Users
│   ├── Active Users (/admin/users)
│   └── Deleted Users (/admin/users/deleted)
├── Categories (/admin/categories)
├── Courses (/admin/courses)
├── Intakes (/admin/intakes)
├── Enrollments (/admin/enrollments)
└── Customer Contact Request (/admin/customer-contact-requests)
```

### Breadcrumb Navigation

#### Active Users Page
```
Admin > Users
```

#### Deleted Users Page
```
Admin > Users > Deleted Users
```

#### User Deletion History
```
Admin > Users > Deleted Users > Deletion History
```

### Quick Navigation Tabs
Available on all user management pages:
- **Active Users** - Links to `/admin/users`
- **Deleted Users** - Links to `/admin/users/deleted`

## Route Parameters

### Search Parameters (Query Strings)

#### Deleted Users Page (`/admin/users/deleted`)
- `page` - Page number (default: 1)
- `pageSize` - Items per page (default: 10)
- `search` - Search term for user name/email
- `deleted_by` - Filter by admin who deleted the user
- `date_from` - Filter deletions from this date
- `date_to` - Filter deletions to this date
- `sortBy` - Sort field (default: 'deleted_at')
- `order` - Sort order: 'asc' | 'desc' (default: 'desc')

#### User Deletion History (`/admin/users/deleted/[id]/history`)
- `id` - User UUID (required path parameter)

## Permissions and Access Control

### Required Permissions
- **View Deleted Users**: Admin or Super Admin role
- **Restore Users**: Super Admin role only
- **View Deletion History**: Admin or Super Admin role
- **Delete Users**: Admin or Super Admin role

### Route Protection
All routes are protected by:
1. Authentication check (`requireAdmin()`)
2. Role-based access control
3. Middleware validation for deleted user routes

## Data Prefetching

### Server-Side Prefetching
All routes implement server-side data prefetching using TanStack Query:

#### Deleted Users Page
- Prefetches deleted users list with current filters
- Prefetches deletion statistics
- Handles errors gracefully with empty state

#### User Deletion History
- Prefetches user deletion history
- Validates user existence
- Handles missing users with not-found page

## SEO and Metadata

### Page Titles
- Active Users: "User Management | Admin Dashboard | Hope International"
- Deleted Users: "Deleted Users | Admin Dashboard | Hope International"
- Deletion History: "User Deletion History | Admin Dashboard | Hope International"

### Meta Tags
- All admin pages have `robots: { index: false, follow: false }`
- Descriptive meta descriptions for each page
- Proper Open Graph tags for admin dashboard

## Error Handling

### Client-Side Error Boundaries
- QueryErrorWrapper for TanStack Query errors
- Graceful fallbacks for failed data fetching
- User-friendly error messages

### Server-Side Error Handling
- Proper error responses from server actions
- Validation error handling
- Database error recovery

## Performance Optimizations

### Caching Strategy
- Server-side prefetching with appropriate stale times
- Query invalidation on mutations
- Optimistic updates for better UX

### Loading States
- Skeleton components for all loading states
- Suspense boundaries for code splitting
- Progressive loading for large datasets

## Security Considerations

### Route Security
- All routes require admin authentication
- Role-based access control
- CSRF protection via server actions
- Input validation and sanitization

### Audit Trail
- All deletion operations are logged
- Admin action tracking
- IP address and user agent logging
- Timestamp tracking for compliance

## Future Enhancements

### Planned Features
- Bulk deletion operations UI
- Advanced filtering options
- Export functionality for audit reports
- Real-time notifications for deletion events
- Scheduled deletion management interface

### API Endpoints
All functionality uses server actions instead of API routes for better security and performance:
- `softDeleteUserAction`
- `restoreUserAction`
- `getDeletedUsersAction`
- `getUserDeletionHistoryAction`
- `cancelScheduledDeletionAction`
