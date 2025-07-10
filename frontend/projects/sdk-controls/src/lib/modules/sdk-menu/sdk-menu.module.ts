import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { PrimeNGModule } from '../../imports/primeng.module';
import { SdkCustomPanelMenuModule } from '../sdk-custom-panelmenu/sdk-custom-panelmenu';
import { SdkMenuTabsComponent } from './components/sdk-menu-tabs/sdk-menu-tabs.component';
import { SdkMenuComponent } from './components/sdk-menu/sdk-menu.component';

@NgModule({
  declarations: [
    SdkMenuComponent,
    SdkMenuTabsComponent
  ],
  imports: [
    CommonModule,
    PrimeNGModule,
    TranslateModule,
    SdkCustomPanelMenuModule
  ],
  exports: [
    SdkMenuComponent,
    SdkMenuTabsComponent
  ]
})
export class SdkMenuModule { }
