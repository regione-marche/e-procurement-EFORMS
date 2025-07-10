import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SdkDebounceClickDirective } from './sdk-debounce-click.directive';

@NgModule({
    declarations: [
        SdkDebounceClickDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SdkDebounceClickDirective
    ]
})
export class SdkDebounceClickModule {

}