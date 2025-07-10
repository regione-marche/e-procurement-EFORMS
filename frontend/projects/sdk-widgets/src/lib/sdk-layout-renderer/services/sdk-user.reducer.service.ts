import { Injectable, Injector } from '@angular/core';
import { SdkBaseService, SdkReducer, SdkStateMap, SdkStoreAction, UserProfile } from '@maggioli/sdk-commons';

@Injectable({ providedIn: 'root' })
export class SdkUserReducer extends SdkBaseService implements SdkReducer {

    constructor(inj: Injector) { super(inj) }

    public run(state: SdkStateMap, action: SdkStoreAction<UserProfile>): SdkStateMap {
        try {
            return { ...state, userProfile: action.payload }
        } catch (e) {
            return { ...state };
        }
    }

}
