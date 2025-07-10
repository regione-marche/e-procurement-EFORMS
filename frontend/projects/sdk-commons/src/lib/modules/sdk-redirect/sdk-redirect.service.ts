import { Injectable } from '@angular/core';
import { clone, each, get, indexOf, isEmpty, isObject, keys, size, split } from 'lodash-es';

import { IDictionary } from '../sdk-shared/types/sdk-common.types';

@Injectable({ providedIn: 'root' })
export class SdkRedirectService {

    public redirect(route: string, params?: IDictionary<string>, keepRouteParams?: boolean): void {
        if (!isEmpty(route)) {
            if (keepRouteParams !== true) {
                if (indexOf(route, '?') > -1) {
                    route = route.substring(0, indexOf(route, '?'));
                }
                route += this.buildQueryParams(params);
            }
            window.location.href = route;
        }
    }

    public buildQueryParams(params: IDictionary<string>): string {
        if (isObject(params)) {
            let finalParams: string = '?';
            let paramsKeys: Array<string> = keys(params);
            each(paramsKeys, (key: string, index: number) => {
                let value = get(params, key);
                finalParams += key + '=' + value;
                if (index < size(paramsKeys) - 1) {
                    finalParams += '&';
                }
            });
            return finalParams;
        }
        return '';
    }

    public parseQueryParams(queryString: string): IDictionary<string> {
        if (queryString == null || isEmpty(queryString)) {
            return {};
        }
        let parsed: string = clone(queryString);
        parsed = parsed.startsWith('?') ? parsed.substring(1) : parsed;
        let paramsDict: IDictionary<string> = {};
        let params: Array<string> = split(parsed, '&');
        if (params != null && params.length > 0) {
            each(params, (param: string) => {
                let pair: Array<string> = split(param, '=');
                paramsDict[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
            });
        }
        return paramsDict;
    }
}