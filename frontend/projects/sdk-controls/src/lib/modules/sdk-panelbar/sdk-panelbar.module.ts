import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkClickModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';

import { SdkButtonModule } from '../sdk-button/sdk-button.module';
import { SdkPanelbarTabComponent } from './components/sdk-panelbar-tab/sdk-panelbar-tab.component';
import { SdkPanelbarComponent } from './components/sdk-panelbar/sdk-panelbar.component';

@NgModule({
  declarations: [
    SdkPanelbarComponent,
    SdkPanelbarTabComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SdkButtonModule,
    SdkClickModule
  ],
  exports: [
    SdkPanelbarComponent
  ]
})
export class SdkPanelbarModule { }
