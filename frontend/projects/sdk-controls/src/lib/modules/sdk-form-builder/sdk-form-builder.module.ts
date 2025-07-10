import { CommonModule } from '@angular/common';
import { Injector, NgModule, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { SdkAbstractComponent, SdkClickModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';
import { forOwn } from 'lodash-es';

import { PrimeNGModule } from '../../imports/primeng.module';
import { SdkFormModule } from '../sdk-form/sdk-form.module';
import { SdkFormBuilderComponent } from './components/sdk-form-builder/sdk-form-builder.component';
import { SdkFormDynamicSectionComponent } from './components/sdk-form-dynamic-section/sdk-form-dynamic-section.component';
import { SdkFormGroupListComponent } from './components/sdk-form-group-list/sdk-form-group-list.component';
import { SdkFormGroupComponent } from './components/sdk-form-group/sdk-form-group.component';
import { SdkFormSectionListComponent } from './components/sdk-form-section-list/sdk-form-section-list.component';
import { SdkFormSectionComponent } from './components/sdk-form-section/sdk-form-section.component';
import { elementsMap } from './sdk-form-builder.elements';

@NgModule({
  declarations: [
    SdkFormBuilderComponent,
    SdkFormGroupComponent,
    SdkFormGroupListComponent,
    SdkFormSectionListComponent,
    SdkFormSectionComponent,
    SdkFormDynamicSectionComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    SdkFormModule,
    TranslateModule,
    PrimeNGModule,
    SdkClickModule
  ],
  exports: [
    SdkFormBuilderComponent,
    SdkFormGroupComponent,
    SdkFormGroupListComponent,
    SdkFormSectionListComponent,
    SdkFormSectionComponent,
    SdkFormDynamicSectionComponent
  ]
})
export class SdkFormBuilderModule {
  constructor(private inj: Injector) { this.defineElements() }

  protected defineElements(): void {
    forOwn(elementsMap(), this.defineElement)
  }

  protected defineElement = (type: Type<SdkAbstractComponent<any, any, any>>, key: string): void => {
    customElements.get(key) || customElements.define(key, createCustomElement(type, { injector: this.inj }));
  }
}
