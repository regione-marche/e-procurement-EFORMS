import { Injectable, Injector } from '@angular/core';

import { SdkBaseSubjectService } from '../sdk-subject/sdk-base-subject.service';

@Injectable({ providedIn: 'root' })
export class SdkRefreshService extends SdkBaseSubjectService<boolean> {

    constructor(inj: Injector) { super(inj) }

}