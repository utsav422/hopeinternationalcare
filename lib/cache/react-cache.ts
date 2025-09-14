// React Cache utilities for client-side caching
import { cache } from 'react';
import { logger } from '@/utils/logger';

// Cache configuration for React cache
export const REACT_CACHE_CONFIG = {
  // Enable/disable cache monitoring in development
  enableMonitoring: process.env.NODE_ENV === 'development',
  
  // Cache key prefixes for organization
  prefixes: {
    public: 'public',
    user: 'user', 
    admin: 'admin',
    api: 'api',
  },
} as const;

// React cache monitoring (development only)
interface ReactCacheMetrics {
  calls: number;
  lastCall: Date;
  functionName: string;
}

const reactCacheMetrics = new Map<string, ReactCacheMetrics>();

// Enhanced React cache wrapper with monitoring
export function createReactCache<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    name?: string;
    enableMonitoring?: boolean;
    onCacheHit?: (name: string, args: any[]) => void;
    onCacheMiss?: (name: string, args: any[]) => void;
  }
): T {
  const { 
    name = fn.name || 'anonymous',
    enableMonitoring = REACT_CACHE_CONFIG.enableMonitoring,
    onCacheHit,
    onCacheMiss 
  } = options || {};

  const cachedFn = cache(fn);

  if (!enableMonitoring) {
    return cachedFn;
  }

  // Wrap with monitoring for development
  return ((...args: any[]) => {
    const startTime = Date.now();
    
    try {
      const result = cachedFn(...args);
      
      // Track metrics
      const existing = reactCacheMetrics.get(name) || { 
        calls: 0, 
        lastCall: new Date(), 
        functionName: name 
      };
      existing.calls++;
      existing.lastCall = new Date();
      reactCacheMetrics.set(name, existing);

      const duration = Date.now() - startTime;
      
      if (duration < 1) {
        // Likely a cache hit (very fast)
        onCacheHit?.(name, args);
        logger.debug('React cache hit', { function: name, duration: `${duration}ms` });
      } else {
        // Likely a cache miss (slower)
        onCacheMiss?.(name, args);
        logger.debug('React cache miss', { function: name, duration: `${duration}ms` });
      }

      return result;
    } catch (error) {
      logger.error('React cache error', {
        function: name,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }) as T;
}

// Batch cache creation for multiple functions
export function createReactCacheBatch<T extends Record<string, (...args: any[]) => any>>(
  functions: T,
  options?: {
    prefix?: string;
    enableMonitoring?: boolean;
  }
): { [K in keyof T]: T[K] } {
  const { prefix = '', enableMonitoring = REACT_CACHE_CONFIG.enableMonitoring } = options || {};
  
  const cached = {} as { [K in keyof T]: T[K] };
  
  for (const [key, fn] of Object.entries(functions)) {
    const name = prefix ? `${prefix}.${key}` : key;
    cached[key as keyof T] = createReactCache(fn, {
      name,
      enableMonitoring,
    });
  }
  
  return cached;
}

// React cache utilities
export const reactCacheUtils = {
  // Get React cache metrics (development only)
  getMetrics: () => {
    if (!REACT_CACHE_CONFIG.enableMonitoring) {
      return { message: 'Monitoring disabled in production' };
    }

    const metrics = Array.from(reactCacheMetrics.entries()).map(([name, data]) => ({
      name,
      ...data,
    }));

    return {
      totalFunctions: metrics.length,
      totalCalls: metrics.reduce((sum, m) => sum + m.calls, 0),
      functions: metrics.sort((a, b) => b.calls - a.calls),
    };
  },

  // Clear React cache metrics
  clearMetrics: () => {
    reactCacheMetrics.clear();
    logger.info('React cache metrics cleared');
  },

  // Log cache performance summary
  logPerformanceSummary: () => {
    if (!REACT_CACHE_CONFIG.enableMonitoring) return;

    const metrics = reactCacheUtils.getMetrics();
    if ('functions' in metrics) {
      logger.info('React Cache Performance Summary', {
        totalFunctions: metrics.totalFunctions,
        totalCalls: metrics.totalCalls,
        topFunctions: metrics.functions.slice(0, 5).map(f => ({
          name: f.name,
          calls: f.calls,
        })),
      });
    }
  },
};

// Predefined React cache creators for common patterns
export const createPublicCache = <T extends (...args: any[]) => any>(fn: T, name?: string) =>
  createReactCache(fn, { 
    name: name || `${REACT_CACHE_CONFIG.prefixes.public}.${fn.name}`,
  });

export const createUserCache = <T extends (...args: any[]) => any>(fn: T, name?: string) =>
  createReactCache(fn, { 
    name: name || `${REACT_CACHE_CONFIG.prefixes.user}.${fn.name}`,
  });

export const createAdminCache = <T extends (...args: any[]) => any>(fn: T, name?: string) =>
  createReactCache(fn, { 
    name: name || `${REACT_CACHE_CONFIG.prefixes.admin}.${fn.name}`,
  });

export const createApiCache = <T extends (...args: any[]) => any>(fn: T, name?: string) =>
  createReactCache(fn, { 
    name: name || `${REACT_CACHE_CONFIG.prefixes.api}.${fn.name}`,
  });

// Cache invalidation helpers for React cache
// Note: React cache automatically invalidates on component unmount/re-render
export const reactCacheInvalidation = {
  // Force component re-render to invalidate React cache
  // This would typically be done by updating component state/props
  
  // Log cache invalidation (for debugging)
  logInvalidation: (reason: string, component?: string) => {
    if (REACT_CACHE_CONFIG.enableMonitoring) {
      logger.debug('React cache invalidation', { reason, component });
    }
  },
};

// Development-only cache debugging utilities
export const cacheDebug = {
  // Monitor cache performance in development
  startMonitoring: () => {
    if (!REACT_CACHE_CONFIG.enableMonitoring) return;

    // Log performance summary every 30 seconds in development
    const interval = setInterval(() => {
      reactCacheUtils.logPerformanceSummary();
    }, 30000);

    // Clear interval on page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        clearInterval(interval);
      });
    }

    logger.info('React cache monitoring started');
  },

  // Log cache state for debugging
  logCacheState: (componentName: string, cacheKeys: string[]) => {
    if (REACT_CACHE_CONFIG.enableMonitoring) {
      logger.debug('Cache state', { component: componentName, keys: cacheKeys });
    }
  },
};

// Export cache function for backward compatibility
export { cache } from 'react';
