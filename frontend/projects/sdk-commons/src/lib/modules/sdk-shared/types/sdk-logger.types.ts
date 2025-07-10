import { SdkLoggerLevel } from '../enums/sdk-logger.enums';

export interface ISdkLogger {

    log(message: any, ...additional: any[]): void;

    trace(message: any, ...additional: any[]): void;

    debug(message: any, ...additional: any[]): void;

    info(message: any, ...additional: any[]): void;

    warn(message: any, ...additional: any[]): void;

    error(message: any, ...additional: any[]): void;

    fatal(message: any, ...additional: any[]): void;
}

export interface ISdkLoggerConfig {
    consoleLogLevel?: SdkLoggerLevel;
}

export interface ISdkLogMessage {
    level: SdkLoggerLevel;
    timestamp: string;
    fileName: string;
    lineNumber: string;
    message: string;
}

export interface ISdkLogListener {
    log(level: SdkLoggerLevel, logObject: ISdkLogMessage): void;
}