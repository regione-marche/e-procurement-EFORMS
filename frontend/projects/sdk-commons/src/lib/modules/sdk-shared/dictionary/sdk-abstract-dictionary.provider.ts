import { isEmpty, isUndefined } from 'lodash-es';

import { IDictionary, ISdkDictionaryProvider } from '../types/sdk-common.types';

export abstract class SdkAbstractDictionaryProvider implements ISdkDictionaryProvider {

    public constructor() { }

    protected abstract prefix(): string;

    protected get window(): Window {
        return (window as Window);
    }

    public get map(): IDictionary<any> {
        const key = this.prefix();

        if (isUndefined(this.window[key])) {
            this.window[key] = {};
        }

        return this.window[key];
    }

    public set map(val: IDictionary<any>) {
        const key = this.prefix();

        if (isUndefined(val)) {
            this.window[key] = {};
        } else {
            this.window[key] = val;
        }
    }

    public dictionary(name: string, val?: IDictionary<any>): IDictionary<any> {
        if (isEmpty(val) === false) {
            this.setDictionary(name, val);
        }
        return this.getDictionary(name);
    }

    private setDictionary(name: string, val: IDictionary<any>): void {
        const map = this.map;
        map[name] = val;
    }

    private getDictionary(name: string): IDictionary<any> {
        const map = this.map;

        if (isUndefined(map[name])) {
            map[name] = {};
        }

        return map[name];
    }
}
