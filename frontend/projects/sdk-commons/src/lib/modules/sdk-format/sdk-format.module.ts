import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SdkCurrencyFormatPipe } from './pipe/sdk-currency-format.pipe';
import { SdkNumberFormatPipe } from './pipe/sdk-number-format.pipe';
import { SdkNumberFormatService } from './service/sdk-number-format.service';
import { SdkDateFormatPipe } from './pipe/sdk-date-format.pipe';

@NgModule({
  declarations: [
    SdkCurrencyFormatPipe,
    SdkDateFormatPipe,
    SdkNumberFormatPipe
  ],
  imports: [
    CommonModule
  ],
  providers: [
    SdkNumberFormatService
  ],
  exports: [
    SdkCurrencyFormatPipe,
    SdkDateFormatPipe,
    SdkNumberFormatPipe
  ]
})
export class SdkFormatModule { }
