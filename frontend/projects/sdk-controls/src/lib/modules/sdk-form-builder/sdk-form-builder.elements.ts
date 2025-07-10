import { Type } from '@angular/core';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';

import { SdkDatepickerComponent } from '../sdk-date/components/sdk-datepicker/sdk-datepicker.component';
import { SdkAutocompleteComponent } from '../sdk-form/components/sdk-autocomplete/sdk-autocomplete.component';
import { SdkCheckboxComponent } from '../sdk-form/components/sdk-checkbox/sdk-checkbox.component';
import { SdkComboboxComponent } from '../sdk-form/components/sdk-combobox/sdk-combobox.component';
import { SdkDocumentComponent } from '../sdk-form/components/sdk-document/sdk-document.component';
import { SdkDocumentsListComponent } from '../sdk-form/components/sdk-documents-list/sdk-documents-list.component';
import { SdkHiddenComponent } from '../sdk-form/components/sdk-hidden/sdk-hidden.component';
import { SdkMaskedTextboxComponent } from '../sdk-form/components/sdk-masked-textbox/sdk-masked-textbox.component';
import { SdkMultipleAutocompleteComponent } from '../sdk-form/components/sdk-multiple-autocomplete/sdk-multiple-autocomplete.component';
import { SdkMultiselectComponent } from '../sdk-form/components/sdk-multiselect/sdk-multiselect.component';
import { SdkNumericTextboxComponent } from '../sdk-form/components/sdk-numeric-textbox/sdk-numeric-textbox.component';
import { SdkPasswordComponent } from '../sdk-form/components/sdk-password/sdk-password.component';
import { SdkRadioComponent } from '../sdk-form/components/sdk-radio/sdk-radio.component';
import { SdkSliderComponent } from '../sdk-form/components/sdk-slider/sdk-slider.component';
import { SdkSwitchComponent } from '../sdk-form/components/sdk-switch/sdk-switch.component';
import { SdkTextComponent } from '../sdk-form/components/sdk-text/sdk-text.component';
import { SdkTextareaComponent } from '../sdk-form/components/sdk-textarea/sdk-textarea.component';
import { SdkTextboxMatrixComponent } from '../sdk-form/components/sdk-textbox-matrix/sdk-textbox-matrix.component';
import { SdkTextboxComponent } from '../sdk-form/components/sdk-textbox/sdk-textbox.component';
import { SdkTextModalComponent } from '../sdk-form/components/sdk-textmodal/sdk-textmodal.component';
import { SdkTreeComponent } from '../sdk-form/components/sdk-tree/sdk-tree.component';
import { SdkFormDynamicSectionComponent } from './components/sdk-form-dynamic-section/sdk-form-dynamic-section.component';
import { SdkFormGroupListComponent } from './components/sdk-form-group-list/sdk-form-group-list.component';
import { SdkFormSectionListComponent } from './components/sdk-form-section-list/sdk-form-section-list.component';

/**
 * @ignore
 */
export function elementsMap(): IDictionary<Type<SdkAbstractComponent<any, any, any>>> {
    return {
        'sdk-form-autocomplete': SdkAutocompleteComponent,
        'sdk-form-multiple-autocomplete': SdkMultipleAutocompleteComponent,
        'sdk-form-combobox': SdkComboboxComponent,
        'sdk-form-masked-textbox': SdkMaskedTextboxComponent,
        'sdk-form-multiselect': SdkMultiselectComponent,
        'sdk-form-numeric-textbox': SdkNumericTextboxComponent,
        'sdk-form-slider': SdkSliderComponent,
        'sdk-form-switch': SdkSwitchComponent,
        'sdk-form-textarea': SdkTextareaComponent,
        'sdk-form-textbox': SdkTextboxComponent,
        'sdk-form-datepicker': SdkDatepickerComponent,
        'sdk-form-group-list': SdkFormGroupListComponent,
        'sdk-form-section-list': SdkFormSectionListComponent,
        'sdk-form-document': SdkDocumentComponent,
        'sdk-form-documents-list': SdkDocumentsListComponent,
        'sdk-form-text': SdkTextComponent,
        'sdk-form-textbox-matrix': SdkTextboxMatrixComponent,
        'sdk-form-text-modal': SdkTextModalComponent,
        'sdk-form-tree': SdkTreeComponent,
        'sdk-form-hidden': SdkHiddenComponent,
        'sdk-form-checkbox': SdkCheckboxComponent,
        'sdk-form-password': SdkPasswordComponent,
        'sdk-form-dynamic-section': SdkFormDynamicSectionComponent,
        'sdk-form-radio':SdkRadioComponent
        
    };
}

/**
 * @ignore
 */
export const TYPE_MAP: IDictionary<string> = {
    'AUTOCOMPLETE': 'sdk-form-autocomplete',
    'MULTIPLE-AUTOCOMPLETE': 'sdk-form-multiple-autocomplete',
    'COMBOBOX': 'sdk-form-combobox',
    'MASKED-TEXTBOX': 'sdk-form-masked-textbox',
    'MULTISELECT': 'sdk-form-multiselect',
    'NUMERIC-TEXTBOX': 'sdk-form-numeric-textbox',
    'SLIDER': 'sdk-form-slider',
    'SWITCH': 'sdk-form-switch',
    'TEXTAREA': 'sdk-form-textarea',
    'TEXTBOX': 'sdk-form-textbox',
    'DATEPICKER': 'sdk-form-datepicker',
    'FORM-GROUP': 'sdk-form-group-list',
    'FORM-SECTION': 'sdk-form-section-list',
    'DOCUMENT': 'sdk-form-document',
    'DOCUMENTS-LIST': 'sdk-form-documents-list',
    'TEXT': 'sdk-form-text',
    'TEXTBOX-MATRIX': 'sdk-form-textbox-matrix',
    'TEXTMODAL': 'sdk-form-text-modal',
    'HIDDEN': 'sdk-form-hidden',
    'CHECKBOX': 'sdk-form-checkbox',
    'PASSWORD': 'sdk-form-password',
    'DYNAMIC-FORM-SECTION': 'sdk-form-dynamic-section',
    'RADIOBUTTON':'sdk-form-radio'
};