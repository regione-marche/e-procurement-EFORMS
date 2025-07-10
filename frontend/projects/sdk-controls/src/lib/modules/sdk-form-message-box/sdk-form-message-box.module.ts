import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import { SdkFormMessageBoxComponent } from './components/sdk-form-message-box/sdk-form-message-box.component';


@NgModule({
    declarations: [
        SdkFormMessageBoxComponent
    ],
    imports: [
        CommonModule,
        TranslateModule
    ],
    exports: [
        SdkFormMessageBoxComponent
    ]
})
export class SdkFormMessageBoxModule { }
