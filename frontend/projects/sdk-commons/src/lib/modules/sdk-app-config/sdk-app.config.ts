import { InjectionToken } from '@angular/core';

export class SdkAppEnvConfig {
    environment: any;
    APP_NAME: string;
}

export let SDK_APP_CONFIG = new InjectionToken<SdkAppEnvConfig>(undefined);