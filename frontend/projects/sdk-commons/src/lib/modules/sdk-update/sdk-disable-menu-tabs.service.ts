import { Injectable, Injector } from '@angular/core';

import { SdkBaseBehaviorSubjectService } from '../sdk-subject/sdk-base-behaviorsubject.service';

@Injectable({ providedIn: 'root' })
export class SdkDisableMenuTabsService extends SdkBaseBehaviorSubjectService<boolean> {

    constructor(inj: Injector) {
        // Imposto il value a false per mantenere la retrocompatibilita'
        // e gestire il caso di rendering iniziale della pagina con la sidebar NON collassata
        super(inj, false);
    }

}