import { Type } from '@angular/core';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';

import { SdkBasicButtonComponent } from './modules/sdk-button/components/sdk-basic-button/sdk-basic-button.component';
import {
    SdkDropdownButtonComponent,
} from './modules/sdk-button/components/sdk-dropdown-button/sdk-dropdown-button.component';

/**
 * Repository per i componenti renderizzabili all'interno della toolbar
 */
export const SdkControlsRepo: IDictionary<Type<SdkAbstractComponent<any, any, any>>> = {
    BUTTON: SdkBasicButtonComponent,
    DROPDOWN: SdkDropdownButtonComponent
}
