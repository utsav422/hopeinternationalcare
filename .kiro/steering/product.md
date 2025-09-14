---
inclusion: always
---

# Product Overview & Development Guidelines

Hope International is an educational institution website for aged care training in Nepal. The platform serves as both a public-facing website and a comprehensive management system.

## Core Features & Implementation Patterns

### Public Website
- **Course Catalog**: Dynamic course listings with filtering by category, affiliation, and intake dates
- **Contact Forms**: Customer contact requests with admin reply system
- **SEO Optimization**: Structured data, meta tags, and sitemap generation for course discovery

### Admin Panel (`/admin` routes)
- **Complete CRUD Operations**: Courses, enrollments, payments, users, categories, affiliations
- **Data Tables**: Use TanStack Table with server-side pagination, filtering, and sorting
- **Form Validation**: React Hook Form + Zod schemas for all admin forms
- **Soft Deletion**: All entities support soft delete with `deleted_at` timestamps

### User Portal (`/users` routes)
- **Enrollment Tracking**: View course progress and enrollment status
- **Payment History**: Complete transaction records and receipts
- **Profile Management**: Update personal information and preferences

## User Roles & Access Patterns

### Authentication Flow
- **Public Users**: No authentication required for browsing
- **Regular Users**: Supabase auth with email/password
- **Administrators**: Separate admin auth flow with `service_role` permissions

### Authorization Conventions
- Use `requireAdmin()` for admin-only server actions
- Use `requireUser()` for authenticated user actions  
- Use `getCurrentUser()` for optional authentication
- Check user roles in middleware for route protection

## Key Entities & Relationships

### Core Data Models
- **Courses**: Linked to categories, affiliations, and multiple intakes
- **Enrollments**: Connect users to specific course intakes with payment tracking
- **Payments**: Support partial payments and refund processing
- **Intakes**: Course scheduling with start dates and capacity limits
- **User Profiles**: Extended user data with soft deletion support

### Business Rules
- Users can enroll in multiple courses but only once per intake
- Payments must be linked to specific enrollments
- Admin replies to customer contact requests are tracked and logged
- All user data supports soft deletion for compliance

## Development Conventions

### Feature Implementation
- Create server actions in `/lib/server-actions/{domain}/`
- Add React Query hooks in `/hooks/{domain}/`
- Build reusable components in `/components/Custom/`
- Use consistent error handling with `{ success, error, data }` pattern

### Data Fetching Patterns
- Use server actions for mutations and complex queries
- Implement optimistic updates where appropriate
- Cache data with React Query for better UX
- Handle loading and error states consistently

### Form Handling
- All forms use React Hook Form + Zod validation
- Server-side validation mirrors client-side schemas
- Display validation errors with toast notifications
- Support both create and update operations in single forms