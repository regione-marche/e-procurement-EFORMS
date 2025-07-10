import { forEach } from 'lodash-es';

import { SdkLoggerLevel } from '../../sdk-shared/enums/sdk-logger.enums';
import { ISdkLogger, ISdkLoggerConfig, ISdkLogListener, ISdkLogMessage } from '../../sdk-shared/types/sdk-logger.types';

export class SdkStandardProviderLogger implements ISdkLogger {

    constructor(private config: ISdkLoggerConfig, private listeners: Array<ISdkLogListener>) { }

    public log(message: string): void {
        this.doLog(SdkLoggerLevel.LOG, message);
    }

    public trace(message: string): void {
        this.doLog(SdkLoggerLevel.TRACE, message);
    }

    public debug(message: string): void {
        this.doLog(SdkLoggerLevel.DEBUG, message);
    }

    public info(message: string): void {
        this.doLog(SdkLoggerLevel.INFO, message);
    }

    public warn(message: string): void {
        this.doLog(SdkLoggerLevel.WARN, message);
    }

    public error(message: string): void {
        this.doLog(SdkLoggerLevel.ERROR, message);
    }

    public fatal(message: string): void {
        this.doLog(SdkLoggerLevel.FATAL, message);
    }

    private doLog(level: SdkLoggerLevel, message: string): void {

        const isLogLevelEnabled = level >= this.config.consoleLogLevel;

        if (!(message && isLogLevelEnabled)) {
            return;
        }

        const timestamp = new Date().toISOString();

        const callerDetails = this.callerDetails();

        const logObject: ISdkLogMessage = {
            level, message, timestamp,
            fileName: callerDetails.fileName,
            lineNumber: callerDetails.lineNumber
        };

        this.emit(level, logObject);
    }

    private callerDetails(): { lineNumber: string, fileName: string } {
        try {
            const err = (new Error(''));

            // this should produce the line which NGX Logger was called
            const callerLine = err.stack.split('\n')[4].split('/');

            // returns the file:lineNumber
            const fileLineNumber = callerLine[callerLine.length - 1].replace(/[)]/g, '').split(':');

            // returns fileName end lineNumber
            return { fileName: fileLineNumber[0], lineNumber: fileLineNumber[1] };

        } catch (e) {
            console.log(e);
        }

        // returns nulls
        return { fileName: null, lineNumber: null };

    }

    private emit(level: SdkLoggerLevel, logObject: ISdkLogMessage): void {
        // TODO: uso subject per creare un messaggio che verrà catturato da interessati

        forEach(this.listeners, (one: ISdkLogListener) => {
            setTimeout(() => this.emitOne(one, level, logObject));
        });

    }

    private emitOne(one: ISdkLogListener, level: SdkLoggerLevel, logObject: ISdkLogMessage): void {
        one.log(level, logObject);
    }

}