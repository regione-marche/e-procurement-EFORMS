import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { SdkClickModule, SdkFormatModule } from '@maggioli/sdk-commons';
import { SdkButtonModule, SdkFormBuilderModule } from '@maggioli/sdk-controls';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';

import { SplitButtonModule } from 'primeng/splitbutton';
import {
  SdkTableCellActionsIconViewerComponent,
} from './components/cell-viewer/cell-actions-icon-viewer/sdk-table-cell-actions-icon-viewer.component';
import {
  SdkTableCellActionsViewerComponent,
} from './components/cell-viewer/cell-actions-viewer/sdk-table-cell-actions-viewer.component';
import {
  SdkTableCellBooleanViewerComponent,
} from './components/cell-viewer/cell-boolean-viewer/sdk-table-cell-boolean-viewer.component';
import {
  SdkTableCellButtonViewerComponent,
} from './components/cell-viewer/cell-button-viewer/sdk-table-cell-button-viewer.component';
import {
  SdkTableCellCurrencyViewerComponent,
} from './components/cell-viewer/cell-currency-viewer/sdk-table-cell-currency-viewer.component';
import {
  SdKTableCellDateViewerComponent,
} from './components/cell-viewer/cell-date-viewer/sdk-table-cell-date-viewer.component';
import { SdkTableCellDropdownActionsIconViewerComponent } from './components/cell-viewer/cell-dropdown-actions-icon-viewer/sdk-table-cell-dropdown-actions-icon-viewer.component';
import {
  SdkTableCellFactoryViewerComponent,
} from './components/cell-viewer/cell-factory-viewer/sdk-table-cell-factory-viewer.component';
import {
  SdkTableCellHierarchicalLinkViewerComponent,
} from './components/cell-viewer/cell-hierarchical-link-viewer/sdk-table-cell-hierarchical-link-viewer.component';
import {
  SdkTableCellIconViewerComponent,
} from './components/cell-viewer/cell-icon-viewer/sdk-table-cell-icon-viewer.component';
import {
  SdkTableCellLinkViewerComponent,
} from './components/cell-viewer/cell-link-viewer/sdk-table-cell-link-viewer.component';
import {
  SdkTableCellNumberViewerComponent,
} from './components/cell-viewer/cell-number-viewer/sdk-table-cell-number-viewer.component';
import {
  SdkTableCellStringViewerComponent,
} from './components/cell-viewer/cell-string-viewer/sdk-table-cell-string-viewer.component';
import { SdkTableFilterComponent } from './components/filter/sdk-table-filter.component';
import { SdkTableComponent } from './components/sdk-table.component';
import { SdkTableViewRefDirective } from './directives/sdk-table.view-ref.directive';
import { SdkDatasourceService } from './services/sdk-table.datasource.service';

export const viewer = [
  SdkTableCellActionsViewerComponent,
  SdkTableCellCurrencyViewerComponent,
  SdKTableCellDateViewerComponent,
  SdkTableCellLinkViewerComponent,
  SdkTableCellNumberViewerComponent,
  SdkTableCellStringViewerComponent,
  SdkTableCellActionsIconViewerComponent,
  SdkTableCellBooleanViewerComponent,
  SdkTableCellButtonViewerComponent,
  SdkTableCellIconViewerComponent,
  SdkTableCellHierarchicalLinkViewerComponent,
  SdkTableCellDropdownActionsIconViewerComponent
];

@NgModule({
  declarations: [
    SdkTableComponent,
    SdkTableViewRefDirective,
    SdkTableCellFactoryViewerComponent,
    SdkTableFilterComponent,
    viewer
  ],
  imports: [
    CommonModule,
    TableModule,
    TranslateModule,
    SdkFormatModule,
    SdkFormBuilderModule,
    AccordionModule,
    SdkButtonModule,
    SdkClickModule,
    SplitButtonModule
  ],
  exports: [
    SdkTableComponent,
    viewer
  ]
})
export class SdkTableModule {
  static forRoot(): ModuleWithProviders<SdkTableModule> {
    return {
      ngModule: SdkTableModule,
      providers: [SdkDatasourceService]
    }
  }
}
