import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SdkClickModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';

import { PrimeNGModule } from '../../imports/primeng.module';
import { SdkButtonModule } from '../sdk-button/sdk-button.module';
import { SdkFormModule } from '../sdk-form/sdk-form.module';
import { SdkAdvancedSearchComponent } from './components/sdk-advanced-search/sdk-advanced-search.component';
import { SdkMixedSearchComponent } from './components/sdk-mixed-search/sdk-mixed-search.component';
import { SdkSimpleSearchComponent } from './components/sdk-simple-search/sdk-simple-search.component';

@NgModule({
  declarations: [
    SdkSimpleSearchComponent,
    SdkAdvancedSearchComponent,
    SdkMixedSearchComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    SdkButtonModule,
    SdkFormModule,
    PrimeNGModule,
    TranslateModule,
    FormsModule,
    SdkClickModule
  ],
  exports: [
    SdkSimpleSearchComponent,
    SdkAdvancedSearchComponent,
    SdkMixedSearchComponent
  ]
})
export class SdkSearchModule { }
