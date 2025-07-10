import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { isObject } from 'lodash-es';

import { SdkBreadcrumbConfig, SdkBreadcrumbItem, SdkBreadcrumbOutput } from '../../sdk-breadcrumb.domain';


/**
 * Componente per renderizzare una breadcrumb
 */
@Component({
  selector: 'sdk-breadcrumb',
  templateUrl: './sdk-breadcrumb.component.html',
  styleUrls: ['./sdk-breadcrumb.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkBreadcrumbComponent extends SdkAbstractComponent<SdkBreadcrumbConfig, void, SdkBreadcrumbOutput> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  @HostBinding('class') classNames = `sdk-breadcrumb`;

  /**
   * @ignore
   */
  public config: SdkBreadcrumbConfig;

  /**
   * @ignore
   */
  public canBeFocused: boolean = true;

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
  protected onConfig(config: SdkBreadcrumbConfig): void {
    setTimeout(() => {
      if (this.config != null) {
        this.markForCheck(() => {
          this.config.items = [];
        });
      }
      this.markForCheck(() => {
        this.config = { ...config };
        this.isReady = true;
      });
    });
  }

  /**
   * @ignore
   */
  protected onData(_data: any): void { }

  /**
   * @ignore
   */
  protected onOutput(_data: SdkBreadcrumbOutput): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void {
    setTimeout(() => {
      this.markForCheck(() => this.canBeFocused = state == false);
    });
  }

  // #region Public

  /**
   * @ignore
   */
  public trackByCode(index: number, item: SdkBreadcrumbItem): string | number {
    return isObject(item) ? item.code : index;
  }

  /**
   * @ignore
   */
  public onClick(_event: Event, item: SdkBreadcrumbItem): void {
    if (this.config.disabled !== true) {
      let obj: SdkBreadcrumbOutput = { item };
      this.emitOutput(obj);
    }
  }

  // #endregion
}
