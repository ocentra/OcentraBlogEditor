import { Logger } from './logger';

// Global logging configuration
export class GlobalLogger {
  private static isProduction: boolean = process.env.NODE_ENV === 'production';
  private static enabledComponents: Set<string> = new Set();
  private static disabledComponents: Set<string> = new Set();
  private static registeredLoggers: Map<string, Logger> = new Map();

  public static registerLogger(prefix: string, logger: Logger): void {
    this.registeredLoggers.set(prefix, logger);
    // If component is in enabled set, enable it
    if (this.enabledComponents.has(prefix)) {
      logger.enable();
    }
    // If component is in disabled set, disable it
    if (this.disabledComponents.has(prefix)) {
      logger.disable();
    }
  }

  public static initialize(): void {
    // Disable all logging in production by default
    if (this.isProduction) {
      this.disableAll();
    } else {
      this.enableAll();
    }
  }

  public static enableComponent(component: string): void {
    this.enabledComponents.add(component);
    this.disabledComponents.delete(component);
    const logger = this.registeredLoggers.get(component);
    if (logger) {
      logger.enable();
    }
  }

  public static disableComponent(component: string): void {
    this.disabledComponents.add(component);
    this.enabledComponents.delete(component);
    const logger = this.registeredLoggers.get(component);
    if (logger) {
      logger.disable();
    }
  }

  public static enableAll(): void {
    this.enabledComponents.clear();
    this.disabledComponents.clear();
    this.registeredLoggers.forEach(logger => logger.enable());
  }

  public static disableAll(): void {
    this.enabledComponents.clear();
    this.disabledComponents.clear();
    this.registeredLoggers.forEach(logger => logger.disable());
  }

  public static isComponentEnabled(component: string): boolean {
    return this.enabledComponents.has(component);
  }

  public static isComponentDisabled(component: string): boolean {
    return this.disabledComponents.has(component);
  }

  public static getEnabledComponents(): string[] {
    return Array.from(this.enabledComponents);
  }

  public static getDisabledComponents(): string[] {
    return Array.from(this.disabledComponents);
  }

  public static getRegisteredComponents(): string[] {
    return Array.from(this.registeredLoggers.keys());
  }

  public static setProductionMode(isProduction: boolean): void {
    this.isProduction = isProduction;
    if (isProduction) {
      this.disableAll();
    } else {
      this.enableAll();
    }
  }
}

// Initialize global logger
GlobalLogger.initialize();

// Make GlobalLogger available globally for logger registration
if (typeof window !== 'undefined') {
  (window as any).GlobalLogger = GlobalLogger;
} 