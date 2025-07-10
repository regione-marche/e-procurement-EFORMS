import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkClickModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';

import { PrimeNGModule } from '../../imports/primeng.module';
import { SdkOverlayPanelComponent } from './components/sdk-overlay-panel/sdk-overlay-panel.component';

@NgModule({
  declarations: [
    SdkOverlayPanelComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    PrimeNGModule,
    SdkClickModule
  ],
  exports: [
    SdkOverlayPanelComponent
  ]
})
export class SdkOverlayPanelModule { }
