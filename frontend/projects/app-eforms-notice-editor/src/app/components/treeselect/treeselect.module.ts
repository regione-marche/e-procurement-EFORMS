import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'primeng/api';
import { AutoFocusModule } from 'primeng/autofocus';
import { ChevronDownIcon } from 'primeng/icons/chevrondown';
import { SearchIcon } from 'primeng/icons/search';
import { TimesIcon } from 'primeng/icons/times';
import { OverlayModule } from 'primeng/overlay';
import { RippleModule } from 'primeng/ripple';
import { TreeModule } from 'primeng/tree';
import { TreeSelectCustom } from './treeselect.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    OverlayModule,
    RippleModule,
    SharedModule,
    TreeModule,
    AutoFocusModule,
    SearchIcon,
    TimesIcon,
    ChevronDownIcon
  ],
  exports: [TreeSelectCustom, OverlayModule, SharedModule, TreeModule],
  declarations: [TreeSelectCustom]
})
export class TreeSelectCustomModule {}
