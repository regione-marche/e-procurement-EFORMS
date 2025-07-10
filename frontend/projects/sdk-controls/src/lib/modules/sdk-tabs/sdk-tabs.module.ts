import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PrimeNGModule } from '../../imports/primeng.module';
import { SdkTabItemComponent } from './components/sdk-tab-item/sdk-tab-item.component';
import { SdkTabsComponent } from './components/sdk-tabs/sdk-tabs.component';

@NgModule({
  declarations: [
    SdkTabsComponent,
    SdkTabItemComponent
  ],
  imports: [
    CommonModule,
    PrimeNGModule,
    TranslateModule
  ],
  exports: [
    SdkTabsComponent,
    SdkTabItemComponent
  ]
})
export class SdkTabsModule { }
