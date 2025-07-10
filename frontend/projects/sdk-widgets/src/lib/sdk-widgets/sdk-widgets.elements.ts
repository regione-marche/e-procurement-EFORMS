import { Type } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { SdkMenuComponent } from '@maggioli/sdk-controls';


export function elementsMap(): IDictionary<Type<any>> {
    return {
        'sdk-menu-webcomponent': SdkMenuComponent
    }
}