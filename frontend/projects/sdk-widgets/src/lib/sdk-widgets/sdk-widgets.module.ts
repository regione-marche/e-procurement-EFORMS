import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Injector, ModuleWithProviders, NgModule, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createTranslateLoader, IDictionary, SdkClickModule } from '@maggioli/sdk-commons';
import {
  SdkBreadcrumbModule,
  SdkButtonModule,
  SdkDialogModule,
  SdkFormModule,
  SdkMenuModule,
  SdkModalModule,
  SdkOverlayPanelModule,
  SdkSearchModule,
  SdkSidebarModule,
} from '@maggioli/sdk-controls';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { forOwn } from 'lodash-es';

import { SdkLayoutRenderedModule } from '../sdk-layout-renderer/sdk-layout-renderer.module';
import { SdkEmptyLayoutWidget } from './components/sdk-empty-layout.widget';
import { SdkLayoutBloccoWidget } from './components/sdk-layout-blocco.widget';
import { SdkLayoutBreadcrumbsWidget } from './components/sdk-layout-breadcrumbs.widget';
import { SdkLayoutContentWidget } from './components/sdk-layout-content.widget';
import { SdkLayoutFooterWidget } from './components/sdk-layout-footer.widget';
import { SdkLayoutHeaderBottomWidget } from './components/sdk-layout-header-bottom.widget';
import { SdkLayoutHeaderMenuWidget } from './components/sdk-layout-header-menu.widget';
import { SdkLayoutHeaderMidWidget } from './components/sdk-layout-header-mid.widget';
import { SdkLayoutHeaderTopWidget } from './components/sdk-layout-header-top.widget';
import { SdkLayoutSectionWidget } from './components/sdk-layout-section.widget';
import { SdkLayoutTitleWidget } from './components/sdk-layout-title.widget';
import { SdkResponsiveMenuSidebarWidget } from './components/sdk-responsive-menu-sidebar.widget';
import { SdkUltimiAccessiComponent } from './components/sdk-ultimi-accessi/sdk-ultimi-accessi.component';
import { elementsMap } from './sdk-widgets.elements';
import { TabellatiCacheService } from './services/tabellati/tabellati-cache.service';
import { TabellatiService } from './services/tabellati/tabellati.service';
import { FormBuilderUtilsService } from './utils/form-builder-utils.service';
import { GridUtilsService } from './utils/grid-utils.service';
import { ProtectionUtilsService } from './utils/protection-utils.service';
import { UltimiAccessiService } from './services/ultimi-accessi.service';
import { SdkUltimiAccessiProvider } from './providers/sdk-ultimi-accessi.provider';
import { TableModule } from 'primeng/table';

const components: Array<any> = [
  SdkUltimiAccessiComponent
];

@NgModule({
  declarations: [
    SdkLayoutHeaderTopWidget,
    SdkLayoutHeaderMidWidget,
    SdkLayoutHeaderBottomWidget,
    SdkLayoutHeaderMenuWidget,
    SdkLayoutFooterWidget,
    SdkLayoutContentWidget,
    SdkLayoutSectionWidget,
    SdkLayoutBreadcrumbsWidget,
    SdkEmptyLayoutWidget,
    SdkLayoutTitleWidget,
    SdkLayoutBloccoWidget,
    SdkResponsiveMenuSidebarWidget,
    components
  ],
  imports: [
    CommonModule,
    SdkButtonModule,
    SdkBreadcrumbModule,
    SdkSearchModule,
    SdkMenuModule,
    SdkSidebarModule,
    SdkModalModule,
    SdkFormModule,
    SdkDialogModule,
    SdkOverlayPanelModule,
    HttpClientModule,
    SdkLayoutRenderedModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (createTranslateLoader),
        deps: [HttpClient]
      }
    }),
    SdkClickModule,
    TableModule
  ],
  exports: [
    SdkLayoutBloccoWidget,
    components
  ]
})
export class SdkWidgetsModule {

  constructor(private inj: Injector) { this.defineElements() }

  protected defineElements(): void {
    forOwn(elementsMap(), this.defineElement)
  }

  protected defineElement = (type: Type<any>, key: string): void => {
    customElements.define(key, createCustomElement(type, { injector: this.inj }))
  }

  static forRoot(params?: IDictionary<string>): ModuleWithProviders<SdkWidgetsModule> {
    return {
      ngModule: SdkWidgetsModule,
      providers: [
        FormBuilderUtilsService,
        ProtectionUtilsService,
        GridUtilsService,
        TabellatiCacheService,
        TabellatiService,

        // ultimi accessi
        UltimiAccessiService,
        SdkUltimiAccessiProvider,
        {
          provide: 'localStoragePrefix',
          useValue: params != null ? params.localStoragePrefix : null
        }
      ]
    }
  }
}
