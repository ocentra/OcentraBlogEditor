export class Logger {
  private enabled: boolean = true;
  private prefix: string;

  private constructor(prefix: string) {
    this.prefix = prefix;
    // Log initialization
    console.log(`${this.prefix} Logger initialized`);
    this.registerWithGlobalLogger();
  }

  private registerWithGlobalLogger(): void {
    if (typeof window !== 'undefined') {
      if ((window as any).GlobalLogger) {
        (window as any).GlobalLogger.registerLogger(this.prefix, this);
        console.log(`${this.prefix} Registered with GlobalLogger`);
      } else {
        console.log(`${this.prefix} GlobalLogger not available, using standalone mode`);
      }
    }
  }

  public static getInstance(prefix: string = '[Ocentra]'): Logger {
    return new Logger(prefix);
  }

  public enable(): void {
    this.enabled = true;
    console.log(`${this.prefix} Logger enabled`);
  }

  public disable(): void {
    this.enabled = false;
    console.log(`${this.prefix} Logger disabled`);
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    // Get the caller's stack trace
    const stack = new Error().stack;
    if (stack) {
      // Parse the stack trace to get method name and line number
      const stackLines = stack.split('\n');
      // Skip the first 3 lines (Error, Logger.formatMessage, and the logger method)
      // Look for the first line that's not from logger.ts
      const callerLine = stackLines.find(line => !line.includes('logger.ts'));
      if (callerLine) {
        const match = callerLine.match(/at (.+?) \((.+?):(\d+):(\d+)\)/);
        if (match) {
          const [, methodName, file, line] = match;
          // Get just the method name without the class/component name
          const shortMethodName = methodName.split('.').pop() || methodName;
          // Remove any component name prefix from the message
          const cleanMessage = message.replace(/^\[?[A-Za-z]+\]?:?\s*/, '');
          return `${this.prefix} [${shortMethodName}:${line}] ${cleanMessage}`;
        }
      }
    }
    // Fallback if we can't get the stack trace
    return `${this.prefix} ${message}`;
  }

  public log(message: string, ...args: any[]): void {
    if (this.isEnabled()) {
      console.log(this.formatMessage('', message), ...args);
    }
  }

  public info(message: string, ...args: any[]): void {
    if (this.isEnabled()) {
      console.info(this.formatMessage('', message), ...args);
    }
  }

  public warn(message: string, ...args: any[]): void {
    if (this.isEnabled()) {
      console.warn(this.formatMessage('WARN', message), ...args);
    }
  }

  public error(message: string, ...args: any[]): void {
    if (this.isEnabled()) {
      // For errors, include the full stack trace
      const error = args[0] instanceof Error ? args[0] : new Error(message);
      console.error(this.formatMessage('ERROR', message), error);
    }
  }

  public debug(message: string, ...args: any[]): void {
    if (this.isEnabled()) {
      console.debug(this.formatMessage('DEBUG', message), ...args);
    }
  }
}

// Default global logger instance
export const logger = Logger.getInstance(); 