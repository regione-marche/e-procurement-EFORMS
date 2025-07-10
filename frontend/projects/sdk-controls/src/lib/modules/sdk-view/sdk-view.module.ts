import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SdkLoaderContainerRefDirective } from './container-ref/sdk-loader.container-ref.directive';

@NgModule({
    declarations: [SdkLoaderContainerRefDirective],
    imports: [CommonModule],
    exports: [SdkLoaderContainerRefDirective]
})
export class SdkViewModule { }
