import { Injectable, Injector } from '@angular/core';

import { SdkBaseBehaviorSubjectService } from '../sdk-subject/sdk-base-behaviorsubject.service';

@Injectable({ providedIn: 'root' })
export class SdkTestataProfileMessageService extends SdkBaseBehaviorSubjectService<boolean> {

    constructor(inj: Injector) { super(inj, false) }

}
