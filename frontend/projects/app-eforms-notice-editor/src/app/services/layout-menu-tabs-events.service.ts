import { Injectable, Injector } from '@angular/core';
import { SdkBaseSubjectService } from '@maggioli/sdk-commons';
import { AccordionEvent } from '../models/app.model';

@Injectable({ providedIn: 'root' })
export class LayoutMenuTabsEventsService extends SdkBaseSubjectService<AccordionEvent> {
  constructor(inj: Injector) {
    super(inj);
  }
}
