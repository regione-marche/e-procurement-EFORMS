import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SdkBaloonDirective } from './sdk-baloon.directive';

@NgModule({
    declarations: [
        SdkBaloonDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SdkBaloonDirective
    ]
})
export class SdkBaloonModule { }