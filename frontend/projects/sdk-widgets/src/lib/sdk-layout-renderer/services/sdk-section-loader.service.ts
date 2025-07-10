import { Injectable, Injector } from '@angular/core';
import { IDictionary, SdkBaseService, SdkLayoutConfig, SdkSectionConfig } from '@maggioli/sdk-commons';
import { forEach, forOwn, isEmpty, keyBy } from 'lodash-es';


@Injectable({ providedIn: 'root' })
export class SdkSectionLoader extends SdkBaseService {

    constructor(inj: Injector) { super(inj) }

    // #region Public

    public parse(config: SdkLayoutConfig): { map: IDictionary<SdkSectionConfig>, roots: Array<string> } {

        let map = this.buildMap(config);

        return { map, roots: this.buildRoots(config, map) }
    }

    // #endregion

    // #region Private

    private buildMap = (config: SdkLayoutConfig) => {

        let map: IDictionary<SdkSectionConfig> = keyBy(config.sections, one => one.id)

        forOwn(map, (value: SdkSectionConfig, key: string) => value.sons = []);

        return map;
    }

    private buildRoots = (config: SdkLayoutConfig, map: IDictionary<SdkSectionConfig>) => {
        let roots: string[] = [];

        forEach(config.sections, one => {
            if (isEmpty(one.parentId)) {
                roots.push(one.id);
            } else {
                map[one.parentId].sons.push(one.id);
            }
        });

        return roots;
    }

    // #endregion

}
