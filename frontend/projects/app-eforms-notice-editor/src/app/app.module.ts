import { NgSwitch, NgSwitchCase } from '@angular/common';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Injector, NgModule, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule, HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { createTranslateLoader, SDK_APP_CONFIG, SdkAbstractWidget, SdkClickModule } from '@maggioli/sdk-commons';
import {
  SdkBaloonModule,
  SdkBreadcrumbModule,
  SdkButtonModule,
  SdkDialogModule,
  SdkLoaderModule,
  SdkMenuModule,
  SdkMessagePanelModule,
  SdkModalModule,
  SdkSidebarModule
} from '@maggioli/sdk-controls';
import { SdkLayoutRenderedModule, SdkWidgetsModule } from '@maggioli/sdk-widgets';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { forOwn } from 'lodash-es';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PanelMenuModule } from 'primeng/panelmenu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { environment } from '../environments/environment';
import { AppWidget } from './app.component';
import { BACKEND_URL, Constants } from './app.constants';
import { customElementsMap, elementsMap } from './app.elements';
import { AppRoutingModule } from './app.routing';
import { AccordionItemComponent } from './components/accordion/accordion-item/accordion-item.component';
import { AccordionComponent } from './components/accordion/accordion/accordion.component';
import { OutputCvsValidationModalComponent } from './components/output-cvs-validation-modal/output-cvs-validation-modal.component';
import { OutputRestModalComponent } from './components/output-rest-modal/output-rest-modal.component';
import { OutputValidationInternalSidebarComponent } from './components/output-validation-internal-sidebar/output-validation-internal-sidebar.component';
import { TreeSelectCustomModule } from './components/treeselect/treeselect.module';
import { FormControlScrollDirective } from './directives/formcontrol-scroll.directive';
import { DynamicFormElementComponent } from './forms/dynamic-form-element/dynamic-form-element.component';
import { authenticationInterceptor } from './interceptors/authentication.interceptor';
import { CannotLoadSectionWidget } from './modules/business/cannot-load/cannot-load-section.widget';
import { EditEnoticeSectionWidget } from './modules/business/edit-enotice/edit-enotice-section.widget';
import { EditPageEnoticeSectionWidget } from './modules/business/edit-page-enotice/edit-page-enotice-section.widget';
import { IntegrationLoaderSectionWidget } from './modules/business/integration-loader/integration-loader-section.widget';
import { JsonOrXmlSelectorSectionWidget } from './modules/business/json-selector/json-selector-section.widget';
import { NewEnoticeSectionWidget } from './modules/business/new-enotice/new-enotice-section.widget';
import { LayoutBreadcrumbsWidget } from './modules/layout/breadcrumbs/layout-breadcrumbs.widget';
import { LayoutSideMenuTabsWidget } from './modules/layout/side-menu-tabs/layout-side-menu-tabs.widget';
import { SdkAppWidget } from './modules/sdk-pages/sdk-app.widget';
import { SdkNotFoundWidget } from './modules/sdk-pages/sdk-not-found.widget';
import { TranslateInputLabelPipe } from './pipes/translate-input-label.pipe';
import { TranslateLabelPipe } from './pipes/translate-label.pipe';

@NgModule({
  declarations: [
    AppWidget,
    NewEnoticeSectionWidget,
    EditEnoticeSectionWidget,
    EditPageEnoticeSectionWidget,
    SdkAppWidget,
    SdkNotFoundWidget,
    LayoutSideMenuTabsWidget,
    TranslateLabelPipe,
    TranslateInputLabelPipe,
    DynamicFormElementComponent,
    AccordionComponent,
    AccordionItemComponent,
    OutputRestModalComponent,
    FormControlScrollDirective,
    OutputCvsValidationModalComponent,
    JsonOrXmlSelectorSectionWidget,
    IntegrationLoaderSectionWidget,
    OutputValidationInternalSidebarComponent,
    LayoutBreadcrumbsWidget,
    CannotLoadSectionWidget
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HammerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    SdkWidgetsModule,
    SdkLayoutRenderedModule,
    SdkLoaderModule,
    SdkButtonModule,
    SdkClickModule,
    NgSwitch,
    NgSwitchCase,
    SdkMenuModule,
    PanelMenuModule,
    FormsModule,
    ReactiveFormsModule,
    RippleModule,
    DropdownModule,
    ButtonModule,
    TooltipModule,
    InputTextareaModule,
    SdkModalModule,
    SdkDialogModule,
    ProgressSpinnerModule,
    AccordionModule,
    TreeSelectCustomModule,
    SdkMessagePanelModule,
    TableModule,
    SdkSidebarModule,
    SdkBaloonModule,
    SdkBreadcrumbModule
  ],
  providers: [
    {
      provide: SDK_APP_CONFIG,
      useValue: {
        environment,
        APP_NAME: Constants.APP_NAME
      }
    },
    { provide: BACKEND_URL, useValue: environment.BACKEND_URL },
    provideHttpClient(withInterceptors([authenticationInterceptor]))
  ],
  bootstrap: [AppWidget]
})
export class AppEformsNoticeEditor {
  constructor(private inj: Injector) {
    this.defineElements();
  }

  protected defineElements(): void {
    forOwn(elementsMap(), this.defineElement);

    forOwn(customElementsMap(), this.defineCustomElement);
  }

  protected defineElement = (type: Type<SdkAbstractWidget<any>>, key: string): void => {
    customElements.define(key, createCustomElement(type, { injector: this.inj }));
  };

  protected defineCustomElement = (type: Type<any>, key: string): void => {
    customElements.define(key, createCustomElement(type, { injector: this.inj }));
  };
}
