import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';


import { SdkFormatModule } from '@maggioli/sdk-commons';
import { SdkEditTableComponent } from './components/sdk-edit-table/sdk-edit-table.component';
import { SdkDetailTableComponent } from './components/sdk-detail-table/sdk-detail-table.component';
import { SdkDateModule } from '../sdk-date/sdk-date.module';
import { SdkFormModule } from '../sdk-form/sdk-form.module';
import { FormsModule } from '@angular/forms';
import { TwoDigitDecimalNumberDirective } from './directive/two-decimals.directive';
import { AllownumbersonlyDirective } from './directive/only-number.directive';
import { ChangeDirective } from './directive/change-value.directive';


@NgModule({
  declarations: [
    SdkEditTableComponent,
    SdkDetailTableComponent,
    TwoDigitDecimalNumberDirective,
    AllownumbersonlyDirective,
    ChangeDirective
  ],
  imports: [
    CommonModule,
    TranslateModule,
    FormsModule 
  ],
  providers: [],
  exports: [
    SdkEditTableComponent,
    SdkDetailTableComponent
  ]
})
export class SdkEditTableModule { }