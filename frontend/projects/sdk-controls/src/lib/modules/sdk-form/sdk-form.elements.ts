import { Type } from '@angular/core';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';

import {
    SdkAutocompleteAdvancedModalComponent,
} from './components/sdk-autocomplete-advanced-modal/sdk-autocomplete-advanced-modal.component';

/**
 * Repository per i componenti renderizzabili (es. modali)
 */
export function sdkFormElementsMap(): IDictionary<Type<SdkAbstractComponent<any, any, any>>> {
    return {
        'sdk-autocomplete-advanced-modal': SdkAutocompleteAdvancedModalComponent
    };
}
