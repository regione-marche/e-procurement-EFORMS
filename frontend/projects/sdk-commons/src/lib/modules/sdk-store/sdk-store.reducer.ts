import { Injector, Type } from '@angular/core';
import { isEmpty, isObject } from 'lodash-es';
import { scan } from 'rxjs/operators';

import { IDictionary } from '../sdk-shared/types/sdk-common.types';
import { SdkReducer, SdkStateMap, SdkStoreAction } from './sdk-store.domain';

/**
 * Reducer function
 */
export function reducer(inj: Injector, state: SdkStateMap, map: IDictionary<Type<SdkReducer>>) {
    return scan(manageAction(inj, map), state);
}

export function manageAction(inj: Injector, map: IDictionary<Type<SdkReducer>>) {
    return (state: SdkStateMap, action: SdkStoreAction) => {

        try {

            let code = map[action.type];

            if (isEmpty(code) === false) {

                let service = inj.get(code);

                if (isObject(service)) {
                    return service.run(state, action);
                }
            }

        } catch (e) { }

        return { ...state };

    };
}
