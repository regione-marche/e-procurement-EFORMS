import { Injectable, Injector } from '@angular/core';
import { forEach, join, toString } from 'lodash-es';

import { ISdkLogger } from '../sdk-shared/types/sdk-logger.types';
import { SdkConfigLoggerService } from './config/sdk-config-logger.service';
import { SdkFactoryLoggerService } from './factory/sdk-factory-logger.service';

@Injectable({
    providedIn: 'root'
})
export class SdkLoggerService implements ISdkLogger {

    private provider: ISdkLogger;

    constructor(injector: Injector) {
        const config = injector.get(SdkConfigLoggerService);
        const factory = injector.get(SdkFactoryLoggerService);

        this.provider = factory.retrieve(config.retrieve());
    }

    public log(message: string, ...additional: any[]): void {
        this.provider.log(this.flat(message, additional));
    }

    public trace(message: string, ...additional: any[]): void {
        this.provider.trace(this.flat(message, additional));
    }

    public debug(message: string, ...additional: any[]): void {
        this.provider.debug(this.flat(message, additional));
    }

    public info(message: string, ...additional: any[]): void {
        this.provider.info(this.flat(message, additional));
    }

    public warn(message: string, ...additional: any[]): void {
        this.provider.warn(this.flat(message, additional));
    }

    public error(message: string, ...additional: any[]): void {
        this.provider.error(this.flat(message, additional));
    }

    public fatal(message: string, ...additional: any[]): void {
        this.provider.fatal(this.flat(message, additional));
    }

    private flat(message: string, additional: any[]): string {

        let array: Array<string> = [];

        array.push(toString(message));

        forEach(additional, (one: any) => {
            try {
                array.push(JSON.stringify(one));
            } catch (e) { }
        });

        let joined = join(array, ' ');

        return joined;

    }

}