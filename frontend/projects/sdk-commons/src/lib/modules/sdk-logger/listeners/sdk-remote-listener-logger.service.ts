import { Injectable } from '@angular/core';

import { SdkLoggerLevel } from '../../sdk-shared/enums/sdk-logger.enums';
import { ISdkLogListener, ISdkLogMessage } from '../../sdk-shared/types/sdk-logger.types';

@Injectable({
    providedIn: 'root'
})
export class SdkRemoteListenerLoggerService implements ISdkLogListener {

    constructor() { }

    public log(level: SdkLoggerLevel, logObject: ISdkLogMessage): void {

        // TODO: chiamata rest al server

    }

}
