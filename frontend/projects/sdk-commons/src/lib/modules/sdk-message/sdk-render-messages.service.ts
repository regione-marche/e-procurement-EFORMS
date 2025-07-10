import { Injectable, Injector } from '@angular/core';

import { SdkRenderMap } from '../sdk-shared/types/sdk-loader.types';
import { SdkBaseBehaviorSubjectService } from '../sdk-subject/sdk-base-behaviorsubject.service';

@Injectable({ providedIn: 'root' })
export class SdkRenderMessageService extends SdkBaseBehaviorSubjectService<SdkRenderMap> {

    constructor(inj: Injector) { super(inj, null) }

}
