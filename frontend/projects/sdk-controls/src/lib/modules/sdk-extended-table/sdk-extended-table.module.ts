import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkFormatModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';

import { SdkExtendedTableComponent } from './components/sdk-extended-table/sdk-extended-table.component';

@NgModule({
  declarations: [
    SdkExtendedTableComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    SdkFormatModule
  ],
  providers: [],
  exports: [
    SdkExtendedTableComponent
  ]
})
export class SdkExtendedTableModule { }
