// utils/logger.ts
// Simple logging utility that complies with project standards
export const logger = {
  error: (message: string, meta?: Record<string, unknown>): void => {
    // In a real application, this would send logs to a logging service
    // For now, we'll just format the message
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? ` ${JSON.stringify(meta)}` : '';
    // We're not using console.log directly due to linter rules
    // In a production environment, this would integrate with a proper logging service
    process.stdout.write(
      `[${timestamp}] [ERROR]: ${message}${formattedMeta}\n`
    );
  },
  warn: (message: string, meta?: Record<string, unknown>): void => {
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? ` ${JSON.stringify(meta)}` : '';
    process.stdout.write(`[${timestamp}] [WARN]: ${message}${formattedMeta}\n`);
  },
  info: (message: string, meta?: Record<string, unknown>): void => {
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? ` ${JSON.stringify(meta)}` : '';
    process.stdout.write(`[${timestamp}] [INFO]: ${message}${formattedMeta}\n`);
  },
  debug: (message: string, meta?: Record<string, unknown>): void => {
    const timestamp = new Date().toISOString();
    const formattedMeta = meta ? ` ${JSON.stringify(meta)}` : '';
    process.stdout.write(
      `[${timestamp}] [DEBUG]: ${message}${formattedMeta}\n`
    );
  },
};
