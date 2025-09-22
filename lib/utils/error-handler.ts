/**
 * Standardized error handling utilities for all modules
 */

// Base error class for all application errors
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// Validation error class
export class ValidationError extends AppError {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message, code, details, 400);
    this.name = 'ValidationError';
  }
}

// Database error class
export class DatabaseError extends AppError {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message, code, details, 500);
    this.name = 'DatabaseError';
  }
}

// Authentication error class
export class AuthenticationError extends AppError {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message, code, details, 401);
    this.name = 'AuthenticationError';
  }
}

// Authorization error class
export class AuthorizationError extends AppError {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message, code, details, 403);
    this.name = 'AuthorizationError';
  }
}

// Not found error class
export class NotFoundError extends AppError {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message, code, details, 404);
    this.name = 'NotFoundError';
  }
}

// Conflict error class
export class ConflictError extends AppError {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, any>
  ) {
    super(message, code, details, 409);
    this.name = 'ConflictError';
  }
}

// Standardized API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  details?: Record<string, any>;
  statusCode?: number;
}

// Standardized error response format
export function createErrorResponse(error: unknown): ApiResponse<never> {
  // Handle our custom error types
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode
    };
  }
  
  // Handle JavaScript built-in errors
  if (error instanceof Error) {
    return {
      success: false,
      error: error.message,
      code: 'UNKNOWN_ERROR',
      statusCode: 500
    };
  }
  
  // Handle unknown errors
  return {
    success: false,
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500
  };
}

// Standardized success response format
export function createSuccessResponse<T>(data: T, statusCode: number = 200): ApiResponse<T> {
  return {
    success: true,
    data,
    statusCode
  };
}

// Helper function to wrap async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<ApiResponse<T>> {
  try {
    const result = await operation();
    return createSuccessResponse(result);
  } catch (error) {
    console.error(`Error in ${operationName}:`, error);
    return createErrorResponse(error);
  }
}