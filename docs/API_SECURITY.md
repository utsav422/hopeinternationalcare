# API Security Documentation - Hope International

This document outlines the comprehensive API security implementation for the Hope International website.

## Overview

The API security system provides multiple layers of protection:
- **Authentication & Authorization** - User and admin role-based access
- **Rate Limiting** - Prevent abuse and DoS attacks
- **Input Sanitization** - Prevent XSS and injection attacks
- **API Key Management** - Secure external integrations
- **CORS Protection** - Control cross-origin requests
- **Security Headers** - Enhance browser security
- **Request Logging** - Monitor and audit API usage

## Security Middleware

### Core Implementation

The `withApiSecurity` middleware wraps all API routes with comprehensive security:

```typescript
import { withApiSecurity } from '@/lib/api-security/middleware';

export const POST = withApiSecurity(handler, {
  requireAuth: true,
  requireAdmin: false,
  rateLimit: { requests: 100, window: 900 },
  validateInput: true,
});
```

### Configuration Options

```typescript
interface SecurityConfig {
  requireAuth?: boolean;        // Require user authentication
  requireAdmin?: boolean;       // Require admin role
  rateLimit?: {                // Rate limiting configuration
    requests: number;           // Max requests per window
    window: number;            // Time window in seconds
  };
  requireApiKey?: boolean;      // Require API key
  allowedMethods?: string[];    // Allowed HTTP methods
  validateInput?: boolean;      // Enable input sanitization
  cors?: {                     // CORS configuration
    origins: string[];
    methods: string[];
    headers: string[];
  };
}
```

## Authentication & Authorization

### User Authentication

- **Session-based** - Uses Supabase authentication
- **Role-based access** - `authenticated` and `service_role`
- **Automatic session validation** - Middleware checks session validity

### Admin Protection

```typescript
// Admin-only endpoint
export const GET = withApiSecurity(handler, {
  requireAuth: true,
  requireAdmin: true,
});
```

### Public Endpoints

```typescript
// Public endpoint (no auth required)
export const GET = withApiSecurity(handler, {
  requireAuth: false,
  requireAdmin: false,
});
```

## Rate Limiting

### Predefined Limits

```typescript
export const RATE_LIMITS = {
  PUBLIC: { requests: 100, window: 900 },      // 100 req/15min
  CONTACT_FORM: { requests: 5, window: 300 },  // 5 req/5min
  AUTH: { requests: 10, window: 900 },         // 10 req/15min
  ADMIN: { requests: 200, window: 900 },       // 200 req/15min
  USER: { requests: 150, window: 900 },        // 150 req/15min
  EMAIL: { requests: 10, window: 3600 },       // 10 req/1hour
};
```

### Action-Specific Rate Limiting

```typescript
// Limit specific actions (e.g., password reset)
const rateLimitResult = await actionRateLimit(
  request, 
  'password_reset', 
  3,    // max attempts
  3600  // 1 hour window
);
```

### Adaptive Rate Limiting

Rate limits automatically adjust based on user role:
- **Anonymous users**: Public limits
- **Authenticated users**: User limits  
- **Admin users**: Admin limits

## Input Sanitization

### Automatic Sanitization

All request bodies are automatically sanitized when `validateInput: true`:

```typescript
// Removes XSS, SQL injection patterns, null bytes
const sanitized = sanitizeInput(requestBody);
```

### Validation Functions

```typescript
// Email validation
const email = sanitizeEmail(input);

// Phone number validation  
const phone = sanitizePhone(input);

// URL validation
const url = sanitizeUrl(input);

// Number validation with bounds
const num = sanitizeNumber(input, min, max);

// Contact form validation
const { isValid, sanitized, errors } = validateContactForm(data);
```

### Spam Detection

```typescript
// Detect repeated identical submissions
const isSpam = detectSpamInput(message, clientId);
```

## API Key Management

### Environment Configuration

```bash
# API Keys for external integrations
ADMIN_API_KEY=hic_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PUBLIC_API_KEY=hic_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
INTEGRATION_API_KEY=hic_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### API Key Usage

```typescript
// Require API key for endpoint
export const GET = withApiSecurity(handler, {
  requireApiKey: true,
});

// Check specific permissions
const hasPermission = hasPermission(request, 'admin:users');
```

### Permission System

```typescript
export const PERMISSIONS = {
  // Public permissions
  PUBLIC_READ: 'public:read',
  PUBLIC_COURSES: 'public:courses',
  
  // User permissions  
  USER_READ: 'user:read',
  USER_ENROLLMENTS: 'user:enrollments',
  
  // Admin permissions
  ADMIN_USERS: 'admin:users',
  ADMIN_COURSES: 'admin:courses',
  ADMIN_REPORTS: 'admin:reports',
};
```

## CORS Protection

### Default Configuration

```typescript
cors: {
  origins: [
    'https://hopeinternationalcare.org',
    'https://www.hopeinternationalcare.org',
    'http://localhost:3000', // Development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization', 'X-API-Key'],
}
```

### Endpoint-Specific CORS

```typescript
// Public API with broader CORS
export const GET = withApiSecurity(handler, {
  cors: {
    origins: ['*'], // Allow all origins for public data
    methods: ['GET', 'OPTIONS'],
    headers: ['Content-Type'],
  },
});
```

## Security Headers

Automatically applied to all responses:

```typescript
'X-Content-Type-Options': 'nosniff'
'X-Frame-Options': 'DENY'  
'X-XSS-Protection': '1; mode=block'
'Referrer-Policy': 'strict-origin-when-cross-origin'
'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
'Strict-Transport-Security': 'max-age=31536000; includeSubDomains' // Production only
```

## Request Logging

### Automatic Logging

All API requests are automatically logged:

```typescript
// Request logging
logger.info('API Request', {
  requestId: 'uuid',
  method: 'POST',
  url: '/api/email',
  userAgent: 'Mozilla/5.0...',
  ip: '192.168.1.1',
});

// Response logging
logger.info('API Response', {
  requestId: 'uuid',
  status: 200,
  duration: '150ms',
});
```

### Error Logging

```typescript
// Error logging with context
logger.error('API Error', {
  requestId: 'uuid',
  error: 'Database connection failed',
  duration: '5000ms',
});
```

## Implementation Examples

### Secure Contact Form API

```typescript
// app/api/email/route.ts
export const POST = withApiSecurity(handleContactForm, {
  requireAuth: false,
  rateLimit: RATE_LIMITS.CONTACT_FORM,
  validateInput: true,
  allowedMethods: ['POST'],
});
```

### Secure Admin API

```typescript
// app/api/admin/users/route.ts
export const GET = withApiSecurity(getUsers, {
  requireAuth: true,
  requireAdmin: true,
  rateLimit: RATE_LIMITS.ADMIN,
  validateInput: false,
});
```

### Public API with API Key

```typescript
// app/api/public/courses/route.ts
export const GET = withApiSecurity(getCourses, {
  requireAuth: false,
  requireApiKey: true, // Optional for public data
  rateLimit: RATE_LIMITS.PUBLIC,
});
```

## Security Best Practices

### 1. Principle of Least Privilege
- Only grant minimum required permissions
- Use role-based access control
- Validate user permissions on every request

### 2. Defense in Depth
- Multiple security layers
- Input validation + sanitization
- Rate limiting + authentication
- Logging + monitoring

### 3. Secure Configuration
- Use environment variables for secrets
- Enable HTTPS in production
- Set secure CORS policies
- Implement proper error handling

### 4. Monitoring & Alerting
- Log all security events
- Monitor rate limit violations
- Alert on suspicious activity
- Regular security audits

## Testing Security

### Rate Limit Testing

```bash
# Test rate limiting
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/email \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","email":"test@example.com","message":"Test message"}'
done
```

### Authentication Testing

```bash
# Test admin endpoint without auth
curl -X GET http://localhost:3000/api/admin/users
# Should return 401 Unauthorized

# Test with valid session
curl -X GET http://localhost:3000/api/admin/users \
  -H "Cookie: session=valid_session_token"
```

### Input Validation Testing

```bash
# Test XSS prevention
curl -X POST http://localhost:3000/api/email \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@example.com","message":"Test"}'
```

## Troubleshooting

### Common Issues

1. **Rate Limit Exceeded**: Check rate limit configuration and client behavior
2. **CORS Errors**: Verify origin is in allowed list
3. **Authentication Failed**: Check session validity and user roles
4. **Input Validation Failed**: Review sanitization rules and input format

### Debug Mode

Enable detailed logging in development:

```typescript
// Set LOG_LEVEL=debug in environment
logger.debug('Security check', { 
  user: request.user,
  permissions: userPermissions,
  rateLimit: rateLimitStatus 
});
```

---

**Last Updated**: August 2024  
**Version**: 1.0  
**Maintainer**: Hope International Development Team
