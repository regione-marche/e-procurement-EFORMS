import { CommonModule } from '@angular/common';
import { Injector, NgModule, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { IDictionary } from '@maggioli/sdk-commons';
import { TranslateModule } from '@ngx-translate/core';
import { forOwn } from 'lodash-es';

import { SdkMessagePanelComponent } from './components/sdk-message-panel/sdk-message-panel.component';
import { SdkMessagePanelService } from './services/sdk-message-panel.service';

@NgModule({
  declarations: [
    SdkMessagePanelComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    TranslateModule
  ],
  providers: [
    SdkMessagePanelService
  ],
  exports: [
    SdkMessagePanelComponent
  ]
})
export class SdkMessagePanelModule {
  constructor(private inj: Injector) { this.defineElements() }

  protected defineElements(): void {
    forOwn(elementsMap(), this.defineElement)
  }

  protected defineElement = (type: Type<any>, key: string): void => {
    customElements.define(key, createCustomElement(type, { injector: this.inj }))
  }
}

/**
 * @ignore
 */
function elementsMap(): IDictionary<Type<any>> {
  return {
    'sdk-message-panel': SdkMessagePanelComponent
  };
}
