import { formatDate } from '@angular/common';
import { Injectable, Injector } from '@angular/core';
import { isEmpty } from 'lodash-es';

import { SdkBaseService } from '../../sdk-base/sdk-base.service';
import { SdkLocaleService } from '../../sdk-locale/sdk-locale.service';


@Injectable({ providedIn: 'root' })
export class SdkDateHelper extends SdkBaseService {

    constructor(inj: Injector) {
        super(inj);
    }

    public format(date: string | number | Date, format: string, locale: string = this.sdkLocaleService.locale): string {
        if (date && !isEmpty(format)) {
            return formatDate(date, format, locale);
        }
        return undefined;
    }

    private get sdkLocaleService(): SdkLocaleService { return this.injectable(SdkLocaleService) }
}