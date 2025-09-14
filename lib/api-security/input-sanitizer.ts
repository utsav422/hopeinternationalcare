// Input Sanitization for API Security
import DOMPurify from 'isomorphic-dompurify';

// Sanitize input data to prevent XSS and injection attacks
export function sanitizeInput(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (typeof data === 'number' || typeof data === 'boolean') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeInput(item));
  }

  if (typeof data === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(data)) {
      // Sanitize the key as well
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeInput(value);
    }
    return sanitized;
  }

  return data;
}

// Sanitize string input
function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return input;
  }

  // Remove null bytes
  let sanitized = input.replace(/\0/g, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Limit length to prevent DoS attacks
  if (sanitized.length > 10000) {
    sanitized = sanitized.substring(0, 10000);
  }

  // Use DOMPurify to clean HTML/XSS
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true, // Keep text content, remove tags
  });

  return sanitized;
}

// Validate and sanitize email
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const sanitized = sanitizeString(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(sanitized) ? sanitized : null;
}

// Validate and sanitize phone number
export function sanitizePhone(phone: string): string | null {
  if (!phone || typeof phone !== 'string') {
    return null;
  }

  // Remove all non-digit characters except + and -
  const sanitized = phone.replace(/[^\d+\-\s()]/g, '');
  
  // Basic phone validation (adjust regex as needed for your requirements)
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{7,20}$/;
  
  return phoneRegex.test(sanitized) ? sanitized : null;
}

// Validate and sanitize URL
export function sanitizeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null;
  }

  try {
    const sanitized = sanitizeString(url);
    const urlObj = new URL(sanitized);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return null;
    }
    
    return urlObj.toString();
  } catch {
    return null;
  }
}

// Sanitize and validate numeric input
export function sanitizeNumber(input: any, min?: number, max?: number): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  const num = typeof input === 'string' ? parseFloat(input) : Number(input);
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (min !== undefined && num < min) {
    return null;
  }

  if (max !== undefined && num > max) {
    return null;
  }

  return num;
}

// Sanitize and validate integer input
export function sanitizeInteger(input: any, min?: number, max?: number): number | null {
  const num = sanitizeNumber(input, min, max);
  return num !== null && Number.isInteger(num) ? num : null;
}

// Sanitize filename for file uploads
export function sanitizeFilename(filename: string): string | null {
  if (!filename || typeof filename !== 'string') {
    return null;
  }

  // Remove path traversal attempts
  let sanitized = filename.replace(/[\/\\:*?"<>|]/g, '');
  
  // Remove leading dots and spaces
  sanitized = sanitized.replace(/^[\.\s]+/, '');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.split('.').pop();
    const name = sanitized.substring(0, 255 - (ext ? ext.length + 1 : 0));
    sanitized = ext ? `${name}.${ext}` : name;
  }

  // Ensure it's not empty after sanitization
  return sanitized.length > 0 ? sanitized : null;
}

// Validate and sanitize UUID
export function sanitizeUuid(uuid: string): string | null {
  if (!uuid || typeof uuid !== 'string') {
    return null;
  }

  const sanitized = sanitizeString(uuid);
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  return uuidRegex.test(sanitized) ? sanitized.toLowerCase() : null;
}

// Sanitize SQL-like input (for search queries, etc.)
export function sanitizeSqlInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove SQL injection patterns
  let sanitized = input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b/gi, '') // Remove SQL keywords
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*/g, '') // Remove SQL block comments start
    .replace(/\*\//g, ''); // Remove SQL block comments end

  return sanitizeString(sanitized);
}

// Comprehensive validation for contact form data
export function validateContactForm(data: any): {
  isValid: boolean;
  sanitized?: any;
  errors: string[];
} {
  const errors: string[] = [];
  const sanitized: any = {};

  // Validate name
  if (!data.name || typeof data.name !== 'string') {
    errors.push('Name is required');
  } else {
    const name = sanitizeString(data.name);
    if (name.length < 2 || name.length > 100) {
      errors.push('Name must be between 2 and 100 characters');
    } else {
      sanitized.name = name;
    }
  }

  // Validate email
  if (!data.email || typeof data.email !== 'string') {
    errors.push('Email is required');
  } else {
    const email = sanitizeEmail(data.email);
    if (!email) {
      errors.push('Invalid email format');
    } else {
      sanitized.email = email;
    }
  }

  // Validate phone (optional)
  if (data.phone) {
    const phone = sanitizePhone(data.phone);
    if (!phone) {
      errors.push('Invalid phone number format');
    } else {
      sanitized.phone = phone;
    }
  }

  // Validate message
  if (!data.message || typeof data.message !== 'string') {
    errors.push('Message is required');
  } else {
    const message = sanitizeString(data.message);
    if (message.length < 10 || message.length > 2000) {
      errors.push('Message must be between 10 and 2000 characters');
    } else {
      sanitized.message = message;
    }
  }

  return {
    isValid: errors.length === 0,
    sanitized: errors.length === 0 ? sanitized : undefined,
    errors,
  };
}

// Rate limiting for specific input patterns (like repeated identical messages)
const recentInputs = new Map<string, { content: string; timestamp: number; count: number }>();

export function detectSpamInput(input: string, clientId: string): boolean {
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  // Clean up old entries
  for (const [key, value] of recentInputs.entries()) {
    if (now - value.timestamp > fiveMinutes) {
      recentInputs.delete(key);
    }
  }
  
  const existing = recentInputs.get(clientId);
  
  if (existing && existing.content === input) {
    existing.count++;
    existing.timestamp = now;
    
    // If same input submitted more than 3 times in 5 minutes, consider it spam
    return existing.count > 3;
  }
  
  recentInputs.set(clientId, {
    content: input,
    timestamp: now,
    count: 1,
  });
  
  return false;
}
