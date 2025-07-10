import { Injectable, Injector } from '@angular/core';
import { SdkBreadcrumbItem } from '@maggioli/sdk-controls';

import { SdkBaseBehaviorSubjectService } from '../sdk-subject/sdk-base-behaviorsubject.service';

@Injectable({ providedIn: 'root' })
export class SdkBreadcrumbsMessageService extends SdkBaseBehaviorSubjectService<Array<SdkBreadcrumbItem>> {

    constructor(inj: Injector) { super(inj, []) }

}
