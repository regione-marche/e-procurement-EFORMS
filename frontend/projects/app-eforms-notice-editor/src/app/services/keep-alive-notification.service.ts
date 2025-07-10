import { Injectable, Injector } from '@angular/core';
import { SdkBaseSubjectService } from '@maggioli/sdk-commons';

@Injectable({ providedIn: 'root' })
export class KeepAliveNotificationService extends SdkBaseSubjectService<boolean> {
    constructor(inj: Injector) {
        super(inj);
    }
}