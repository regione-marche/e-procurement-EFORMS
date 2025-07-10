import { Injectable, Inject } from '@angular/core';

import { SdkSessionContextService } from '../../sdk-context/session/sdk-session-context.service';
import { SdkLoggerLevel } from '../../sdk-shared/enums/sdk-logger.enums';
import { ISdkLoggerConfig } from '../../sdk-shared/types/sdk-logger.types';
import { SDK_APP_CONFIG, SdkAppEnvConfig } from '../../sdk-app-config/sdk-app.config';

@Injectable({
    providedIn: 'root'
})
export class SdkConfigLoggerService {

    constructor(private sessCtxSrv: SdkSessionContextService, @Inject(SDK_APP_CONFIG) private appConfig: SdkAppEnvConfig) {
        // Levels: TRACE|DEBUG|INFO|LOG|WARN|ERROR|FATAL|OFF

        /* application.export().subscribe((ctx) => {
            console.log('ctx >>>', ctx);
        }); */
    }

    public retrieve(): ISdkLoggerConfig {
        // TODO: prender dall'application context del verticale
        return {
            consoleLogLevel: this.appConfig && this.appConfig.environment.LOGGER_LEVEL ? this.getLoggerLevel(this.appConfig.environment.LOGGER_LEVEL) : SdkLoggerLevel.DEBUG
        };

        /*
         {
            level: NgxLoggerLevel.DEBUG,
            disableConsoleLogging: false,
            serverLogLevel: NgxLoggerLevel.DEBUG,
            serverLoggingUrl: `http://127.0.0.1:3456/api/logger`
        }
        */
    }

    private getLoggerLevel(loggerLevel: string): SdkLoggerLevel {
        switch (loggerLevel) {
            case 'TRACE':
                return SdkLoggerLevel.TRACE
            case 'DEBUG':
                return SdkLoggerLevel.DEBUG
            case 'INFO':
                return SdkLoggerLevel.INFO
            case 'LOG':
                return SdkLoggerLevel.LOG
            case 'WARN':
                return SdkLoggerLevel.WARN
            case 'ERROR':
                return SdkLoggerLevel.ERROR
            case 'FATAL':
                return SdkLoggerLevel.FATAL
            case 'OFF':
                return SdkLoggerLevel.OFF
            default:
                return SdkLoggerLevel.DEBUG;
        }
    }
}
