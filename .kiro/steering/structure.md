# Project Structure & Conventions

## Directory Organization

### `/app` - Next.js App Router
- **Route Groups**: `(auth-pages)`, `(protected)` for layout organization
- **Dynamic Routes**: `[slug]` for course pages
- **API Routes**: `/api` for server endpoints
- **Layout Files**: `layout.tsx` for nested layouts
- **Page Files**: `page.tsx` for route components

### `/components` - Reusable Components
- **`/ui`**: shadcn/ui components (Button, Card, Dialog, etc.)
- **`/Custom`**: Project-specific reusable components
- **`/Admin`**: Admin panel specific components organized by feature
- **`/User`**: User portal components
- **`/SEO`**: SEO optimization components

### `/lib` - Core Business Logic
- **`/db`**: Database schema, migrations, and Drizzle configuration
- **`/server-actions`**: Server actions organized by domain (admin, public, user)
- **`/queries`**: Database query functions (if separate from server actions)
- **`/utils`**: Utility functions and helpers
- **`/seo`**: SEO metadata and structured data utilities
- **`/email`**: Email service and templates

### `/hooks` - React Hooks
- **`/admin`**: Admin-specific hooks for data fetching
- **`/user`**: User-specific hooks
- **`/public`**: Public data hooks
- Custom hooks for common functionality

### `/utils` - Utilities & Configuration
- **`/supabase`**: Supabase client configurations
- **`/provider`**: React context providers
- Authentication guards and middleware

## Naming Conventions

### Files & Directories
- **kebab-case** for file and directory names
- **PascalCase** for React components
- **camelCase** for functions and variables

### Database Schema
- **snake_case** for table and column names
- Consistent naming: `created_at`, `updated_at`, `deleted_at`
- Foreign keys: `{table}_id` (e.g., `course_id`, `user_id`)

### API & Server Actions
- Prefix with domain: `adminCourseList`, `publicCourseDetails`
- Use descriptive action names: `upsert`, `deleteById`, `listAll`

## Architecture Patterns

### Data Layer
- **Server Actions** for mutations and complex queries
- **React Query** for client-side state management and caching
- **Zod schemas** for validation at database and form levels
- **Drizzle ORM** with type-safe queries

### Authentication & Authorization
- **Role-based access**: `authenticated`, `service_role`
- **Auth guards**: `requireAdmin()`, `requireUser()`, `getCurrentUser()`
- **Soft deletion** support with `deleted_at` timestamps

### Component Structure
- **Separation of concerns**: UI components vs. business logic
- **Server/Client component distinction** clearly marked
- **Form handling**: React Hook Form + Zod validation
- **Data tables**: TanStack Table with filtering and pagination

### Error Handling
- Consistent error response format: `{ success: boolean, error?: string, data?: T }`
- Client-side error boundaries and toast notifications
- Server-side logging with structured data