import { Injectable, Injector } from '@angular/core';
import { SdkBaseService } from '../sdk-base/sdk-base.service';
import { SdkProvider } from '../sdk-shared/types/sdk-provider.types';
import { IDictionary } from '../sdk-shared/types/sdk-common.types';
import { UserProfile } from '../sdk-store/sdk-store.domain';

@Injectable({ providedIn: 'root' })
export class SdkMenuStrumentiVisibleProvider extends SdkBaseService implements SdkProvider {

    constructor(inj: Injector) {
        super(inj);
    }

    public run(args: IDictionary<any>): boolean {

        let userProfile: UserProfile = args.userProfile;

        let visible: boolean = userProfile && (
            userProfile?.abilitazioni?.includes('ou30') ||
            userProfile?.abilitazioni?.includes('ou89')
        );

        return visible;
    }
}