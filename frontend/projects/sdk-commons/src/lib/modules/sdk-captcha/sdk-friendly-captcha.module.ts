import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkFriendlyCaptchaComponent } from './sdk-friendly-captcha.component';

@NgModule({
    declarations: [
        SdkFriendlyCaptchaComponent
    ],
    imports: [
        CommonModule
    ],
    exports: [
        SdkFriendlyCaptchaComponent
    ]
})
export class SdkFriendlyCaptchaModule {

}