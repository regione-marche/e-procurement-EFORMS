import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SdkClickDirective } from './sdk-click.directive';

@NgModule({
    declarations: [
        SdkClickDirective
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SdkClickDirective
    ]
})
export class SdkClickModule {

}