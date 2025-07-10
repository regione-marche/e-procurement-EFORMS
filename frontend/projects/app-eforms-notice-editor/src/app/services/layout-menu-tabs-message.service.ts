import { Injectable, Injector } from '@angular/core';
import { SdkBaseBehaviorSubjectService } from '@maggioli/sdk-commons';
import { AccordionItem } from '../models/app.model';

@Injectable({ providedIn: 'root' })
export class LayoutMenuTabsMessageService extends SdkBaseBehaviorSubjectService<
  Array<AccordionItem>
> {
  constructor(inj: Injector) {
    super(inj, []);
  }
}
