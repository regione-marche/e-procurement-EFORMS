import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SdkContentRenderWidget } from './components/sdk-content-render.widget';
import { SdkElementLoaderWidget } from './components/sdk-element-loader.widget';
import { SdkLayoutRenderWidget } from './components/sdk-layout-render.widget';
import { SdkSectionRenderWidget } from './components/sdk-section-render.widget';

@NgModule({
    declarations: [
        SdkContentRenderWidget,
        SdkElementLoaderWidget,
        SdkLayoutRenderWidget,
        SdkSectionRenderWidget
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SdkContentRenderWidget,
        SdkElementLoaderWidget,
        SdkLayoutRenderWidget,
        SdkSectionRenderWidget
    ]
})
export class SdkLayoutRenderedModule { }
