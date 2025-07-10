import { Injectable, Injector } from '@angular/core';

import { ISdkLogger, ISdkLoggerConfig, ISdkLogListener } from '../../sdk-shared/types/sdk-logger.types';
import { SdkConsoleListenerLoggerService } from '../listeners/sdk-console-listener-logger.service';
import { SdkRemoteListenerLoggerService } from '../listeners/sdk-remote-listener-logger.service';
import { SdkStandardProviderLogger } from '../provider/sdk-standard-provider-logger.service';

@Injectable({
    providedIn: 'root'
})
export class SdkFactoryLoggerService {

    constructor(private injector: Injector) { }

    public retrieve(config: ISdkLoggerConfig): ISdkLogger {

        // TODO: prendere dalla configurazione le info per istanziare i listeners

        let listeners = this.listeners();

        let provider = new SdkStandardProviderLogger(config, listeners);

        return provider;

    }

    private listeners(): Array<ISdkLogListener> {
        let listeners: Array<ISdkLogListener> = [];

        listeners.push(
            this.injector.get(SdkConsoleListenerLoggerService),
            this.injector.get(SdkRemoteListenerLoggerService),
        );

        return listeners;
    }

}
