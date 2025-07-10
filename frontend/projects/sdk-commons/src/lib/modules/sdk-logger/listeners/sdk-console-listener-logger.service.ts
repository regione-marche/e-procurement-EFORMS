import { Injectable } from '@angular/core';

import { SdkLoggerLevel, SdkLoggerLevelCode } from '../../sdk-shared/enums/sdk-logger.enums';
import { ISdkLogListener, ISdkLogMessage } from '../../sdk-shared/types/sdk-logger.types';

@Injectable({
    providedIn: 'root'
})
export class SdkConsoleListenerLoggerService implements ISdkLogListener {

    constructor() { }

    public log(level: SdkLoggerLevel, logObject: ISdkLogMessage): void {
        const logLevelString = SdkLoggerLevelCode[level];

        const metaString = this.metaString(logObject.timestamp, logLevelString, logObject.fileName, logObject.lineNumber);

        return this._logFunc(level, metaString, logObject.message);
    }

    private _logFunc(level: SdkLoggerLevel, metaString: string, message: string): void {
        try {
            // TODO: gestire i vecchi browser?
            this._logModern(level, metaString, message);
        } catch (err) {
            console.log(`${metaString} - ${message}`);
        }
    }

    private _logModern(level: SdkLoggerLevel, metaString: string, message: string): void {
        const color = this.color(level);

        switch (level) {
            case SdkLoggerLevel.WARN:
                try {
                    console.warn(`%c${metaString}`, `color:${color}`, message);
                } catch (err) {
                    console.warn(`%c${metaString}`, `color:${color}`, JSON.stringify(message));
                }
                break;

            case SdkLoggerLevel.ERROR:
            case SdkLoggerLevel.FATAL:
                try {
                    console.error(`%c${metaString}`, `color:${color}`, message);
                } catch (err) {
                    console.error(`%c${metaString}`, `color:${color}`, JSON.stringify(message));
                }
                break;

            case SdkLoggerLevel.INFO:
                try {
                    console.info(`%c${metaString}`, `color:${color}`, message);
                } catch (err) {
                    console.info(`%c${metaString}`, `color:${color}`, JSON.stringify(message));
                }
                break;

            default:
                try {
                    console.log(`%c${metaString}`, `color:${color}`, message);
                } catch (err) {
                    console.log(`%c${metaString}`, `color:${color}`, JSON.stringify(message));
                }
        }
    }

    private metaString(timestamp: string, logLevel: string, fileName: string, lineNumber: string) {
        // create file details il filename is defined
        const fileDetails = fileName ? ` [${fileName}:${lineNumber}]` : '';

        // create log meta message string
        return `${timestamp} ${logLevel}${fileDetails}`;
    }

    private color(level: SdkLoggerLevel): 'blue' | 'teal' | 'gray' | 'red' | undefined {
        switch (level) {
            case SdkLoggerLevel.TRACE:
                return 'blue';
            case SdkLoggerLevel.DEBUG:
                return 'teal';
            case SdkLoggerLevel.INFO:
            case SdkLoggerLevel.LOG:
                return 'gray';
            case SdkLoggerLevel.WARN:
            case SdkLoggerLevel.ERROR:
            case SdkLoggerLevel.FATAL:
                return 'red';
            case SdkLoggerLevel.OFF:
            default:
                return;
        }
    }

}
