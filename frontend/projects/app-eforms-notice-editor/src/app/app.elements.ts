import { Type } from '@angular/core';
import { IDictionary, SdkAbstractWidget } from '@maggioli/sdk-commons';
import {
  SdkLayoutContentWidget,
  SdkLayoutFooterWidget,
  SdkLayoutHeaderBottomWidget,
  SdkLayoutHeaderMidWidget,
  SdkLayoutHeaderTopWidget,
  SdkLayoutSectionWidget,
  SdkLayoutTitleWidget
} from '@maggioli/sdk-widgets';
import { OutputCvsValidationModalComponent } from './components/output-cvs-validation-modal/output-cvs-validation-modal.component';
import { OutputRestModalComponent } from './components/output-rest-modal/output-rest-modal.component';
import { OutputValidationInternalSidebarComponent } from './components/output-validation-internal-sidebar/output-validation-internal-sidebar.component';
import { CannotLoadSectionWidget } from './modules/business/cannot-load/cannot-load-section.widget';
import { EditEnoticeSectionWidget } from './modules/business/edit-enotice/edit-enotice-section.widget';
import { EditPageEnoticeSectionWidget } from './modules/business/edit-page-enotice/edit-page-enotice-section.widget';
import { IntegrationLoaderSectionWidget } from './modules/business/integration-loader/integration-loader-section.widget';
import { JsonOrXmlSelectorSectionWidget } from './modules/business/json-selector/json-selector-section.widget';
import { NewEnoticeSectionWidget } from './modules/business/new-enotice/new-enotice-section.widget';
import { LayoutBreadcrumbsWidget } from './modules/layout/breadcrumbs/layout-breadcrumbs.widget';
import { LayoutSideMenuTabsWidget } from './modules/layout/side-menu-tabs/layout-side-menu-tabs.widget';

export function elementsMap(): IDictionary<Type<SdkAbstractWidget<any>>> {
  return {
    'sdk-layout-header-top': SdkLayoutHeaderTopWidget,
    'sdk-layout-header-mid': SdkLayoutHeaderMidWidget,
    'sdk-layout-header-bottom': SdkLayoutHeaderBottomWidget,

    'sdk-layout-breadcrumbs': LayoutBreadcrumbsWidget,
    'sdk-layout-section': SdkLayoutSectionWidget,

    'sdk-layout-content': SdkLayoutContentWidget,

    'sdk-layout-footer': SdkLayoutFooterWidget,

    'sdk-layout-title': SdkLayoutTitleWidget,

    'layout-side-menu-tabs': LayoutSideMenuTabsWidget,

    'new-enotice-section': NewEnoticeSectionWidget,
    'edit-enotice-section': EditEnoticeSectionWidget,
    'edit-page-enotice-section': EditPageEnoticeSectionWidget,
    'json-selector-section': JsonOrXmlSelectorSectionWidget,
    'integration-loader-section': IntegrationLoaderSectionWidget,
    'cannot-load-section': CannotLoadSectionWidget
  };
}

export function customElementsMap(): IDictionary<Type<any>> {
  return {
    'output-rest-modal-widget': OutputRestModalComponent,
    'output-csv-validation-modal-widget': OutputCvsValidationModalComponent,
    'output-validation-internal-sidebar-widget': OutputValidationInternalSidebarComponent
  };
}
