import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { isFunction, isObject } from 'lodash-es';

import { SdkTab } from '../../sdk-tabs.domain';
import { of } from 'rxjs';

/**
 * Componente per renderizzare il singolo tab
 */
@Component({
  selector: 'sdk-tab-item',
  templateUrl: './sdk-tab-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTabItemComponent extends SdkAbstractComponent<SdkTab, void, void> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  public config: SdkTab;

  /**
   * @ignore
   */
  @ViewChild('itemContainer') public _itemContainer: ElementRef;

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  /**
   * @ignore
   */
  protected onInit(): void { }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void { }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(data: void): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkTab): void {
    this.config = config;
    this.isReady = true;
    setTimeout(() => {
      if (isObject(this.config)) {
        let selector: string = this.config.content;
        if (selector) {
          let component = document.createElement(selector) as NgElement & WithProperties<any>;
          if (isObject(this.config.contentConfig)) {
            component.config$ = of(this.config.contentConfig);
          }

          if (isObject(this.config.contentInput)) {
            component.data$ = of(this.config.contentInput);
          }

          this.itemContainer.appendChild(component);
          if (isObject(component.output$)) {
            component.addEventListener('output', (data: any) => {
              if (isFunction(this.config.contentOutput)) {
                this.config.contentOutput(data);
              }
            });
          }
          this.markForCheck();
        }
      }
    });
  }

  /**
   * @ignore
   */
  protected onData(_data: void): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  /**
   * @ignore
   */
  public get itemContainer(): HTMLElement {
    return this._itemContainer.nativeElement;
  }

}
