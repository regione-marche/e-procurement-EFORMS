import { InjectionToken, Injector, Type } from '@angular/core';

import { SdkLoggerService } from '../sdk-logger/sdk-logger.service';

export class SdkBaseService {

    constructor(private _inj: Injector) { }

    protected injectable<T>(token: Type<T> | InjectionToken<T>): T { return this._inj.get(token) }

    // #region Getters

    protected get logger(): SdkLoggerService { return this.injectable(SdkLoggerService) }

    // #endregion

}
