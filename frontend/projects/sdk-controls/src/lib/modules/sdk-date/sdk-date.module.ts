import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { PrimeNGModule } from '../../imports/primeng.module';
import { SdkFormMessageBoxModule } from '../sdk-form-message-box/sdk-form-message-box.module';
import { SdkDatepickerComponent } from './components/sdk-datepicker/sdk-datepicker.component';
import { SdkTimepickerComponent } from './components/sdk-timepicker/sdk-timepicker.component';
import { SdkDateMaskDirective } from './directives/sdk-date-mask.directive';

@NgModule({
  declarations: [
    SdkDatepickerComponent,
    SdkTimepickerComponent,
    SdkDateMaskDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SdkFormMessageBoxModule,
    PrimeNGModule
  ],
  exports: [
    SdkDatepickerComponent,
    SdkTimepickerComponent
  ]
})
export class SdkDateModule { }
