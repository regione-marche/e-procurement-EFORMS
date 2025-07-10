import { ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { SdkDialogConfig } from '@maggioli/sdk-controls';
import { isFunction, isObject } from 'lodash-es';
import { Subscription } from 'rxjs';

/**
 * Componente per renderizzare un motivazione dialog
 */
@Component({
  selector: 'sdk-datepicker-dialog',
  templateUrl: './sdk-datepicker-dialog.component.html',
  styleUrls: ['./sdk-datepicker-dialog.component.scss']
})
export class SdkDatePickerDialogComponent extends SdkAbstractComponent<SdkDialogConfig, void, void> implements OnInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkDialogConfig;

  /**
   * @ignore
   */
  private openSubjectSubscription: Subscription;

  /**
   * @ignore
   */
  public data: Date;

  /**
   * @ignore
   */
  public isOpen: boolean = false;

  /**
   * @ignore
   */
  public minSelectableDate: Date = new Date();

  /**
   * @ignore
   */
  private currentCallback: Function;

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
  protected onDestroy(): void {
    this.unsubscribeOpenSubject();
  }

  /**
   * @ignore
   */
  protected onOutput(_data: void): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkDialogConfig): void {
    if (config != null) {
      this.markForCheck(() => {
        this.config = {
          ...config
        };
        delete this.data;
        this.unsubscribeOpenSubject();
        this.openSubjectSubscription = this.config.open.subscribe((callback: Function) => {
          if (isFunction(callback)) {
            this.markForCheck(() => this.open(callback));
          }
        });
        this.isReady = true;
      });
    }
  }

  /**
   * @ignore
   */
  protected onData(_data: void): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private unsubscribeOpenSubject(): void {
    if (isObject(this.openSubjectSubscription)) {
      this.openSubjectSubscription.unsubscribe();
    }
  }

  /**
   * @ignore
   */
  private open = (callback: Function): void => {
    this.currentCallback = callback;
    this.isOpen = true;
  }

  /**
   * @ignore
   */
  public accept = (): void => {
    this.markForCheck(() => {
      this.isOpen = false;
    });
    this.currentCallback(this.data);
  }

  /**
   * @ignore
   */
  public reject(): void {
    this.markForCheck(() => this.isOpen = false);
  }

  // #endregion
}
