import { CommonModule } from '@angular/common';
import { Injector, NgModule, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule } from '@angular/forms';
import { SdkAbstractComponent, SdkBlurModule, SdkClickModule, SdkFormatModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';
import { forOwn } from 'lodash-es';
import { TableModule } from 'primeng/table';

import { PrimeNGModule } from '../../imports/primeng.module';
import { SdkButtonModule } from '../sdk-button/sdk-button.module';
import { SdkFormMessageBoxModule } from '../sdk-form-message-box/sdk-form-message-box.module';
import { SdkModalModule } from '../sdk-modal/sdk-modal.module';
import {
  SdkAutocompleteAdvancedModalComponent
} from './components/sdk-autocomplete-advanced-modal/sdk-autocomplete-advanced-modal.component';
import { SdkAutocompleteComponent } from './components/sdk-autocomplete/sdk-autocomplete.component';
import { SdkCheckboxComponent } from './components/sdk-checkbox/sdk-checkbox.component';
import { DropdownDirective } from './components/sdk-combobox/p-dropdown.directive';
import { SdkComboboxComponent } from './components/sdk-combobox/sdk-combobox.component';
import { SdkDocumentComponent } from './components/sdk-document/sdk-document.component';
import { SdkDocumentsListComponent } from './components/sdk-documents-list/sdk-documents-list.component';
import { SdkHiddenComponent } from './components/sdk-hidden/sdk-hidden.component';
import { SdkMaskedTextboxComponent } from './components/sdk-masked-textbox/sdk-masked-textbox.component';
import {
  SdkMultipleAutocompleteComponent
} from './components/sdk-multiple-autocomplete/sdk-multiple-autocomplete.component';
import { SdkMultiselectComponent } from './components/sdk-multiselect/sdk-multiselect.component';
import { SdkNumericTextboxComponent } from './components/sdk-numeric-textbox/sdk-numeric-textbox.component';
import { SdkPasswordComponent } from './components/sdk-password/sdk-password.component';
import { SdkRadioComponent } from './components/sdk-radio/sdk-radio.component';
import { SdkSliderComponent } from './components/sdk-slider/sdk-slider.component';
import { SdkSwitchComponent } from './components/sdk-switch/sdk-switch.component';
import { SdkTextComponent } from './components/sdk-text/sdk-text.component';
import { SdkTextareaComponent } from './components/sdk-textarea/sdk-textarea.component';
import { SdkTextboxMatrixComponent } from './components/sdk-textbox-matrix/sdk-textbox-matrix.component';
import { SdkTextboxComponent } from './components/sdk-textbox/sdk-textbox.component';
import { SdkTextModalComponent } from './components/sdk-textmodal/sdk-textmodal.component';
import { SdkTreeComponent } from './components/sdk-tree/sdk-tree.component';
import { sdkFormElementsMap } from './sdk-form.elements';
import { SdkDialogModule } from '../sdk-dialog/sdk-dialog.module';


@NgModule({
  declarations: [
    SdkTextboxComponent,
    SdkTextareaComponent,
    SdkNumericTextboxComponent,
    SdkSwitchComponent,
    SdkSliderComponent,
    SdkMaskedTextboxComponent,
    SdkComboboxComponent,
    SdkMultiselectComponent,
    SdkAutocompleteComponent,
    SdkMultipleAutocompleteComponent,
    SdkDocumentComponent,
    SdkTextComponent,
    SdkDocumentsListComponent,
    SdkRadioComponent,
    SdkTextboxMatrixComponent,
    SdkTextModalComponent,
    SdkTreeComponent,
    SdkHiddenComponent,
    SdkCheckboxComponent,
    SdkPasswordComponent,
    SdkAutocompleteAdvancedModalComponent,
    DropdownDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    SdkFormMessageBoxModule,
    SdkButtonModule,
    SdkModalModule,
    PrimeNGModule,
    SdkFormatModule,
    SdkClickModule,
    TableModule,
    SdkBlurModule,
    SdkDialogModule
  ],
  exports: [
    SdkTextboxComponent,
    SdkTextareaComponent,
    SdkNumericTextboxComponent,
    SdkSwitchComponent,
    SdkSliderComponent,
    SdkMaskedTextboxComponent,
    SdkComboboxComponent,
    SdkMultiselectComponent,
    SdkAutocompleteComponent,
    SdkMultipleAutocompleteComponent,
    SdkDocumentComponent,
    SdkTextComponent,
    SdkDocumentsListComponent,
    SdkRadioComponent,
    SdkTextboxMatrixComponent,
    SdkTextModalComponent,
    SdkTreeComponent,
    SdkHiddenComponent,
    SdkCheckboxComponent,
    SdkPasswordComponent
  ]
})
export class SdkFormModule {
  constructor(private inj: Injector) { this.defineElements() }

  protected defineElements(): void {
    forOwn(sdkFormElementsMap(), this.defineElement)
  }

  protected defineElement = (type: Type<SdkAbstractComponent<any, any, any>>, key: string): void => {
    customElements.get(key) || customElements.define(key, createCustomElement(type, { injector: this.inj }));
  }
}
