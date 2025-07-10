import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { isEmpty, isObject } from 'lodash-es';

import { SdkBaseService } from '../sdk-base/sdk-base.service';
import { IDictionary } from '../sdk-shared/types/sdk-common.types';

@Injectable({ providedIn: 'root' })
export class SdkRouterService extends SdkBaseService {

    constructor(inj: Injector, private router: Router) {
        super(inj);
    }

    public navigateToPage(slug: string, params?: IDictionary<any>): Promise<boolean> {
        if (!isEmpty(slug)) {
            if (isObject(params)) {
                return this.router.navigate(['page', slug], { queryParams: params });
            } else {
                return this.router.navigate(['page', slug]);
            }
        }
        return undefined;
    }
}