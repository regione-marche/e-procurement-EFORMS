import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';

import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';


/**
 * Componente per renderizzare un campo hidden
 */
@Component({
  selector: 'sdk-hidden',
  templateUrl: './sdk-hidden.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkHiddenComponent extends SdkAbstractFormField<any, any, any> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: any;
  /**
   * @ignore
   */
  public data: any;

  // #endregion

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  // #region Hooks

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
  protected onOutput(_data: any): void { }

  /**
   * @ignore
   */
  protected onConfig(config: any): void {
    this.markForCheck(() => {
      this.config = config;
      this.isReady = true;
    });
  }

  /**
   * @ignore
   */
  protected onData(data: any): void {
    this.markForCheck(() => {
      this.data = data.data;
      this.emitOutput({ code: this.config.code, data: this.data, valid: undefined });
    });
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

}
