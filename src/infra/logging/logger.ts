import * as appInsights from 'applicationinsights';

/**
 * Application Insights Logger for Notification Service
 *
 * Provides structured logging that integrates with Azure Application Insights.
 * Supports custom dimensions, metrics, and correlation tracking.
 */

// Initialize Application Insights if connection string is available
const connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
let client: appInsights.TelemetryClient | null = null;

if (connectionString) {
    appInsights.setup(connectionString)
        .setAutoCollectRequests(true)
        .setAutoCollectPerformance(true, true)
        .setAutoCollectExceptions(true)
        .setAutoCollectDependencies(true)
        .setAutoCollectConsole(true, true)
        .setUseDiskRetryCaching(true)
        .setSendLiveMetrics(true)
        .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
        .start();

    client = appInsights.defaultClient;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export type LogContext = {
    correlationId?: string;
    userId?: string;
    operation?: string;
    service?: string;
    [key: string]: string | number | boolean | undefined;
};

export type Logger = {
    trace: (message: string, context?: LogContext) => void;
    debug: (message: string, context?: LogContext) => void;
    info: (message: string, context?: LogContext) => void;
    warn: (message: string, context?: LogContext) => void;
    error: (message: string, error?: Error, context?: LogContext) => void;
    trackMetric: (name: string, value: number, context?: LogContext) => void;
    trackEvent: (name: string, context?: LogContext) => void;
    trackDependency: (
        name: string,
        target: string,
        duration: number,
        success: boolean,
        context?: LogContext
    ) => void;
    flush: () => Promise<void>;
};

const SERVICE_NAME = 'notification-service';

/**
 * Converts LogContext to Application Insights custom dimensions
 */
function toCustomDimensions(context?: LogContext): Record<string, string> {
    if (!context) return { service: SERVICE_NAME };

    const dimensions: Record<string, string> = { service: SERVICE_NAME };
    for (const [key, value] of Object.entries(context)) {
        if (value !== undefined) {
            dimensions[key] = String(value);
        }
    }
    return dimensions;
}

/**
 * Gets severity level for Application Insights
 */
function getSeverityLevel(level: LogLevel): appInsights.Contracts.SeverityLevel {
    switch (level) {
        case 'trace':
            return appInsights.Contracts.SeverityLevel.Verbose;
        case 'debug':
            return appInsights.Contracts.SeverityLevel.Verbose;
        case 'info':
            return appInsights.Contracts.SeverityLevel.Information;
        case 'warn':
            return appInsights.Contracts.SeverityLevel.Warning;
        case 'error':
            return appInsights.Contracts.SeverityLevel.Error;
        default:
            return appInsights.Contracts.SeverityLevel.Information;
    }
}

/**
 * Logs a message at the specified level
 */
function log(level: LogLevel, message: string, context?: LogContext): void {
    const timestamp = new Date().toISOString();
    const logPrefix = `[${timestamp}] [${level.toUpperCase()}] [${SERVICE_NAME}]`;
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';

    // Console logging (always available)
    const consoleMessage = `${logPrefix} ${message}${contextStr}`;
    switch (level) {
        case 'trace':
        case 'debug':
            console.debug(consoleMessage);
            break;
        case 'info':
            console.info(consoleMessage);
            break;
        case 'warn':
            console.warn(consoleMessage);
            break;
        case 'error':
            console.error(consoleMessage);
            break;
    }

    // Application Insights logging
    if (client) {
        client.trackTrace({
            message,
            severity: getSeverityLevel(level),
            properties: toCustomDimensions(context),
        });
    }
}

/**
 * Logs an error with stack trace
 */
function logError(message: string, error?: Error, context?: LogContext): void {
    const errorContext: LogContext = {
        ...context,
        errorMessage: error?.message,
        errorStack: error?.stack,
    };

    log('error', message, errorContext);

    // Track exception in Application Insights
    if (client && error) {
        client.trackException({
            exception: error,
            properties: toCustomDimensions(context),
        });
    }
}

/**
 * Tracks a custom metric
 */
function trackMetric(name: string, value: number, context?: LogContext): void {
    console.info(`[METRIC] ${SERVICE_NAME} - ${name}: ${value}`);

    if (client) {
        client.trackMetric({
            name,
            value,
            properties: toCustomDimensions(context),
        });
    }
}

/**
 * Tracks a custom event
 */
function trackEvent(name: string, context?: LogContext): void {
    console.info(`[EVENT] ${SERVICE_NAME} - ${name}`);

    if (client) {
        client.trackEvent({
            name,
            properties: toCustomDimensions(context),
        });
    }
}

/**
 * Tracks a dependency call (e.g., database, external API)
 */
function trackDependency(
    name: string,
    target: string,
    duration: number,
    success: boolean,
    context?: LogContext
): void {
    const status = success ? 'success' : 'failure';
    console.info(`[DEPENDENCY] ${SERVICE_NAME} - ${name} to ${target}: ${status} (${duration}ms)`);

    if (client) {
        client.trackDependency({
            dependencyTypeName: 'HTTP',
            name,
            target,
            duration,
            success,
            resultCode: success ? 200 : 500,
            data: context?.operation as string,
            properties: toCustomDimensions(context),
        });
    }
}

/**
 * Flushes all pending telemetry
 */
async function flush(): Promise<void> {
    if (client) {
        return new Promise((resolve) => {
            client!.flush();
            // Give time for telemetry to be sent
            setTimeout(() => resolve(), 100);
        });
    }
}

/**
 * Main logger instance
 */
export const logger: Logger = {
    trace: (message, context) => log('trace', message, context),
    debug: (message, context) => log('debug', message, context),
    info: (message, context) => log('info', message, context),
    warn: (message, context) => log('warn', message, context),
    error: (message, error, context) => logError(message, error, context),
    trackMetric,
    trackEvent,
    trackDependency,
    flush,
};

/**
 * Creates a child logger with preset context
 */
export function createLogger(baseContext: LogContext): Logger {
    return {
        trace: (msg, ctx) => log('trace', msg, { ...baseContext, ...ctx }),
        debug: (msg, ctx) => log('debug', msg, { ...baseContext, ...ctx }),
        info: (msg, ctx) => log('info', msg, { ...baseContext, ...ctx }),
        warn: (msg, ctx) => log('warn', msg, { ...baseContext, ...ctx }),
        error: (msg, err, ctx) => logError(msg, err, { ...baseContext, ...ctx }),
        trackMetric: (n, v, ctx) => trackMetric(n, v, { ...baseContext, ...ctx }),
        trackEvent: (n, ctx) => trackEvent(n, { ...baseContext, ...ctx }),
        trackDependency: (n, t, d, s, ctx) => trackDependency(n, t, d, s, { ...baseContext, ...ctx }),
        flush: () => flush(),
    };
}

export default logger;
