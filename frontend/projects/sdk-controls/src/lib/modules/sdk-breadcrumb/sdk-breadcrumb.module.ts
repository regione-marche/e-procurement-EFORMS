import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkClickModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';

import { SdkBreadcrumbComponent } from './components/sdk-breadcrumb/sdk-breadcrumb.component';

@NgModule({
  declarations: [
    SdkBreadcrumbComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SdkClickModule
  ],
  exports: [
    SdkBreadcrumbComponent
  ]
})
export class SdkBreadcrumbModule { }
