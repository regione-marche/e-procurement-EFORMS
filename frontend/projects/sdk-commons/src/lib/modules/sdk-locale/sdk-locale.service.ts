import { Injectable, Injector } from '@angular/core';

import { SdkBaseService } from '../sdk-base/sdk-base.service';

@Injectable({ providedIn: 'root' })
export class SdkLocaleService extends SdkBaseService {

    private _locale: string;
    private _currency: string;
    private _dateFormat: string;

    constructor(inj: Injector) {
        super(inj);
    }

    public get locale(): string {
        return this._locale;
    }

    public set locale(value: string) {
        this._locale = value;
    }

    public get currency(): string {
        return this._currency;
    }

    public set currency(value: string) {
        this._currency = value;
    }

    public get dateFormat(): string {
        return this._dateFormat;
    }

    public set dateFormat(value: string) {
        this._dateFormat = value;
    }
}