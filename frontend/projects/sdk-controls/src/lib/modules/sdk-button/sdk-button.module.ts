import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SdkClickModule } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';

import { PrimeNGModule } from '../../imports/primeng.module';
import { SdkBaloonModule } from '../sdk-baloon/sdk-baloon.module';
import { SdkViewModule } from '../sdk-view/sdk-view.module';
import { SdkBasicButtonComponent } from './components/sdk-basic-button/sdk-basic-button.component';
import { SdkButtonGroupComponent } from './components/sdk-button-group/sdk-button-group.component';
import { SdkDropdownButtonComponent } from './components/sdk-dropdown-button/sdk-dropdown-button.component';
import { SdkDropdownDataComponent } from './components/sdk-dropdown-data/sdk-dropdown-data.component';
import {
    SdkResponsiveDropdownButtonComponent,
} from './components/sdk-responsive-dropdown-button/sdk-responsive-dropdown-button.component';
import { SdkToolbarItemComponent } from './components/sdk-toolbar-item/sdk-toolbar-item.component';
import { SdkToolbarComponent } from './components/sdk-toolbar/sdk-toolbar.component';

@NgModule({
    declarations: [
        SdkBasicButtonComponent,
        SdkButtonGroupComponent,
        SdkDropdownButtonComponent,
        SdkToolbarComponent,
        SdkToolbarItemComponent,
        SdkResponsiveDropdownButtonComponent,
        SdkDropdownDataComponent
    ],
    imports: [
        CommonModule,
        SdkViewModule,
        TranslateModule,
        PrimeNGModule,
        SdkBaloonModule,
        SdkClickModule
    ],
    exports: [
        SdkBasicButtonComponent,
        SdkButtonGroupComponent,
        SdkDropdownButtonComponent,
        SdkToolbarComponent,
        SdkToolbarItemComponent,
        SdkResponsiveDropdownButtonComponent
    ]
})
export class SdkButtonModule { }
