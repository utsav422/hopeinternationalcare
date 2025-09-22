/**
 * Standardized logging utilities for all modules
 */

// Log levels
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// Log entry structure
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  module?: string;
  context?: Record<string, any>;
  error?: Error;
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  module?: string;
}

// Logger class
export class Logger {
  private config: LoggerConfig;
  
  constructor(config: LoggerConfig) {
    this.config = config;
  }
  
  // Log error messages
  error(message: string, context?: Record<string, any>, error?: Error) {
    if (this.shouldLog('error')) {
      this.log('error', message, context, error);
    }
  }
  
  // Log warning messages
  warn(message: string, context?: Record<string, any>) {
    if (this.shouldLog('warn')) {
      this.log('warn', message, context);
    }
  }
  
  // Log info messages
  info(message: string, context?: Record<string, any>) {
    if (this.shouldLog('info')) {
      this.log('info', message, context);
    }
  }
  
  // Log debug messages
  debug(message: string, context?: Record<string, any>) {
    if (this.shouldLog('debug')) {
      this.log('debug', message, context);
    }
  }
  
  // Private method to actually log messages
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ) {
    const logEntry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      module: this.config.module,
      context,
      error
    };
    
    // In a production environment, this would send logs to a logging service
    // For now, we'll just output to console
    const logMessage = `[${logEntry.timestamp}] [${logEntry.level.toUpperCase()}]${logEntry.module ? ` [${logEntry.module}]` : ''} ${logEntry.message}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage, context, error);
        break;
      case 'warn':
        console.warn(logMessage, context);
        break;
      case 'info':
        console.info(logMessage, context);
        break;
      case 'debug':
        console.debug(logMessage, context);
        break;
    }
  }
  
  // Determine if a message should be logged based on the configured level
  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }
}

// Create a default logger instance
export const logger = new Logger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  module: 'app'
});

// Create module-specific loggers
export function createModuleLogger(moduleName: string): Logger {
  return new Logger({
    level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
    module: moduleName
  });
}