import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { isObject } from 'lodash-es';
import { Observable, of } from 'rxjs';

import {
  ESdkButtonLook,
  SdkDropdownButtonData,
  SdkToolbarButton,
  SdkToolbarButtonOutput,
  SdkToolbarInput as SdkToolbarConfig,
  SdkToolbarOutput,
} from '../../../sdk-button/sdk-button.domain';

/**
 * Componente per renderizzare una toolbar
 */
@Component({
  selector: 'sdk-toolbar',
  templateUrl: './sdk-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkToolbarComponent extends SdkAbstractComponent<SdkToolbarConfig, void, SdkToolbarOutput> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  public config: SdkToolbarConfig;

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
  protected onOutput(data: SdkToolbarOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkToolbarConfig): void {
    this.config = config;
    this.isReady = true;
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
  public trackByCode(index: number, button: SdkToolbarButton): string | number {
    return isObject(button) ? button.code : index;
  }

  /**
   * @ignore
   */
  public getLook(look: ESdkButtonLook): string {
    return look;
  }

  /**
   * @ignore
   */
  public onClick(out: SdkToolbarButtonOutput): void {
    this.emitOutput(out as SdkToolbarOutput);
  }

  /**
   * @ignore
   */
  public onDropdownButtonClick = (out: SdkDropdownButtonData): void => {
    this.emitOutput(out as SdkToolbarOutput);
  }

  /**
   * @ignore
   */
  public getBtnObs(button: SdkToolbarButton): Observable<SdkToolbarButton> { return of(button) }

}
