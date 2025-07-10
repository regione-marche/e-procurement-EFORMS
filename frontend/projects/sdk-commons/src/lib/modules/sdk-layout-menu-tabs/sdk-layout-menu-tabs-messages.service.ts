import { Injectable, Injector } from '@angular/core';

import { SdkBaseBehaviorSubjectService } from '../sdk-subject/sdk-base-behaviorsubject.service';

@Injectable({ providedIn: 'root' })
export class SdkLayoutMenuTabsMessageService extends SdkBaseBehaviorSubjectService<Array<any>> {

    constructor(inj: Injector) { super(inj, []) }

}
