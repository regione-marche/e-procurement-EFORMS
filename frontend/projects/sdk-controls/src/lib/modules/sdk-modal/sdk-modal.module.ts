import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkClickModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';

import { SdkViewModule } from '../sdk-view/sdk-view.module';
import { SdkModalBackdropComponent } from './components/sdk-modal-backdrop/sdk-modal-backdrop.component';
import { SdkModalComponent } from './components/sdk-modal/sdk-modal.component';

@NgModule({
  declarations: [
    SdkModalComponent,
    SdkModalBackdropComponent
  ],
  imports: [
    CommonModule,
    SdkViewModule,
    SdkClickModule,
    TranslateModule
  ],
  exports: [
    SdkModalComponent
  ]
})
export class SdkModalModule { }
