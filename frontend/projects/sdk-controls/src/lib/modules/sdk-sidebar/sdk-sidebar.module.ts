import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkClickModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';

import { SdkViewModule } from '../sdk-view/sdk-view.module';
import { SdkBackdropComponent } from './components/sdk-backdrop/sdk-backdrop.component';
import { SdkSidebarComponent } from './components/sdk-sidebar/sdk-sidebar.component';

@NgModule({
  declarations: [
    SdkSidebarComponent,
    SdkBackdropComponent
  ],
  imports: [
    CommonModule,
    SdkViewModule,
    SdkClickModule,
    TranslateModule
  ],
  exports: [
    SdkSidebarComponent
  ]
})
export class SdkSidebarModule { }
