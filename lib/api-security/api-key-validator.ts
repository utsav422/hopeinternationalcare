// API Key Validation for Enhanced Security
import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

// API Key configuration
interface ApiKeyConfig {
  key: string;
  name: string;
  permissions: string[];
  rateLimit?: {
    requests: number;
    window: number;
  };
  expiresAt?: Date;
  isActive: boolean;
}

// In production, store these in a secure database
// For now, we'll use environment variables and in-memory storage
const API_KEYS: Map<string, ApiKeyConfig> = new Map();

// Initialize API keys from environment variables
function initializeApiKeys() {
  // Admin API key
  const adminApiKey = process.env.ADMIN_API_KEY;
  if (adminApiKey) {
    API_KEYS.set(hashApiKey(adminApiKey), {
      key: adminApiKey,
      name: 'Admin API Key',
      permissions: ['admin:*', 'user:*', 'public:*'],
      rateLimit: {
        requests: 1000,
        window: 3600, // 1 hour
      },
      isActive: true,
    });
  }

  // Public API key (for external integrations)
  const publicApiKey = process.env.PUBLIC_API_KEY;
  if (publicApiKey) {
    API_KEYS.set(hashApiKey(publicApiKey), {
      key: publicApiKey,
      name: 'Public API Key',
      permissions: ['public:read', 'public:courses', 'public:intakes'],
      rateLimit: {
        requests: 100,
        window: 3600, // 1 hour
      },
      isActive: true,
    });
  }

  // Integration API key (for third-party services)
  const integrationApiKey = process.env.INTEGRATION_API_KEY;
  if (integrationApiKey) {
    API_KEYS.set(hashApiKey(integrationApiKey), {
      key: integrationApiKey,
      name: 'Integration API Key',
      permissions: ['user:read', 'user:enrollments', 'public:*'],
      rateLimit: {
        requests: 500,
        window: 3600, // 1 hour
      },
      isActive: true,
    });
  }
}

// Initialize on module load
initializeApiKeys();

// Hash API key for secure storage
function hashApiKey(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

// Validate API key from request
export async function validateApiKey(request: NextRequest): Promise<boolean> {
  const apiKey = extractApiKey(request);
  
  if (!apiKey) {
    return false;
  }

  const hashedKey = hashApiKey(apiKey);
  const keyConfig = API_KEYS.get(hashedKey);

  if (!keyConfig || !keyConfig.isActive) {
    return false;
  }

  // Check expiration
  if (keyConfig.expiresAt && new Date() > keyConfig.expiresAt) {
    return false;
  }

  return true;
}

// Extract API key from request headers
function extractApiKey(request: NextRequest): string | null {
  // Check X-API-Key header
  const apiKeyHeader = request.headers.get('X-API-Key');
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  // Check Authorization header (Bearer token)
  const authHeader = request.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check query parameter (less secure, but sometimes necessary)
  const url = new URL(request.url);
  const apiKeyParam = url.searchParams.get('api_key');
  if (apiKeyParam) {
    return apiKeyParam;
  }

  return null;
}

// Get API key configuration
export function getApiKeyConfig(request: NextRequest): ApiKeyConfig | null {
  const apiKey = extractApiKey(request);
  
  if (!apiKey) {
    return null;
  }

  const hashedKey = hashApiKey(apiKey);
  return API_KEYS.get(hashedKey) || null;
}

// Check if API key has specific permission
export function hasPermission(request: NextRequest, permission: string): boolean {
  const config = getApiKeyConfig(request);
  
  if (!config) {
    return false;
  }

  // Check for wildcard permissions
  for (const perm of config.permissions) {
    if (perm === '*' || perm === permission) {
      return true;
    }
    
    // Check for namespace wildcards (e.g., "admin:*" matches "admin:users")
    if (perm.endsWith(':*')) {
      const namespace = perm.slice(0, -2);
      if (permission.startsWith(namespace + ':')) {
        return true;
      }
    }
  }

  return false;
}

// Generate new API key
export function generateApiKey(): string {
  const prefix = 'hic'; // Hope International Care
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${randomString}`;
}

// Add new API key (for admin use)
export function addApiKey(config: Omit<ApiKeyConfig, 'key'>): string {
  const apiKey = generateApiKey();
  const hashedKey = hashApiKey(apiKey);
  
  API_KEYS.set(hashedKey, {
    ...config,
    key: apiKey,
  });

  return apiKey;
}

// Revoke API key
export function revokeApiKey(apiKey: string): boolean {
  const hashedKey = hashApiKey(apiKey);
  const config = API_KEYS.get(hashedKey);
  
  if (config) {
    config.isActive = false;
    return true;
  }
  
  return false;
}

// List all API keys (without exposing the actual keys)
export function listApiKeys(): Array<Omit<ApiKeyConfig, 'key'>> {
  return Array.from(API_KEYS.values()).map(config => ({
    name: config.name,
    permissions: config.permissions,
    rateLimit: config.rateLimit,
    expiresAt: config.expiresAt,
    isActive: config.isActive,
  }));
}

// Middleware to require specific permission
export function requirePermission(permission: string) {
  return (request: NextRequest): boolean => {
    return hasPermission(request, permission);
  };
}

// Common permission checks
export const PERMISSIONS = {
  // Public permissions
  PUBLIC_READ: 'public:read',
  PUBLIC_COURSES: 'public:courses',
  PUBLIC_INTAKES: 'public:intakes',
  
  // User permissions
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_ENROLLMENTS: 'user:enrollments',
  USER_PAYMENTS: 'user:payments',
  
  // Admin permissions
  ADMIN_READ: 'admin:read',
  ADMIN_WRITE: 'admin:write',
  ADMIN_USERS: 'admin:users',
  ADMIN_COURSES: 'admin:courses',
  ADMIN_ENROLLMENTS: 'admin:enrollments',
  ADMIN_PAYMENTS: 'admin:payments',
  ADMIN_REPORTS: 'admin:reports',
  
  // System permissions
  SYSTEM_CONFIG: 'system:config',
  SYSTEM_LOGS: 'system:logs',
} as const;

// Validate API key and check permission in one function
export function validateApiKeyWithPermission(
  request: NextRequest,
  permission: string
): boolean {
  return validateApiKey(request) && hasPermission(request, permission);
}

// Get rate limit configuration for API key
export function getApiKeyRateLimit(request: NextRequest): { requests: number; window: number } | null {
  const config = getApiKeyConfig(request);
  return config?.rateLimit || null;
}
