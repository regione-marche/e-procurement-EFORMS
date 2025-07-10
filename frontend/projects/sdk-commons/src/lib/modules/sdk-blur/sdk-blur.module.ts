import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SdkBlurDirective } from './sdk-blur.directive';

@NgModule({
    declarations: [
        SdkBlurDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SdkBlurDirective
    ]
})
export class SdkBlurModule {

}