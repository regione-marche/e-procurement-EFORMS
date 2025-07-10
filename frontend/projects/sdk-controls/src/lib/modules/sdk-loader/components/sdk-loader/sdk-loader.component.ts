import { AfterViewInit, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SdkAbstractComponent, SdkHttpLoaderAction, SdkHttpLoaderService, SdkHttpLoaderType } from '@maggioli/sdk-commons';

/**
 * Componente per realizzare un loader
 */
@Component({
  selector: 'sdk-loader',
  templateUrl: './sdk-loader.component.html',
  styleUrls: ['./sdk-loader.component.scss']
})
export class SdkLoaderComponent extends SdkAbstractComponent<void, void, void> implements OnInit, OnDestroy, AfterViewInit {

  /**
   * @ignore
   */
  public type: SdkHttpLoaderType;
  /**
   * @ignore
   */
  public active: boolean = false;

  /**
   * @ignore
   */
  constructor(inj: Injector, private cdr: ChangeDetectorRef) { super(inj, cdr) }

  /**
   * @ignore
   */
  protected onInit(): void { }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void {
    this.addSubscription(this.sdkHttpLoaderService.sub(this.manageLoader));
  }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(_data: void): void { }

  /**
   * @ignore
   */
  protected onConfig(_config: void): void { }

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
  public get loaderStyle(): Array<string> {
    let styles = new Array<string>();
    if (SdkHttpLoaderType.Initial === this.type) {
      styles.push('initial-loading');
    } else if (SdkHttpLoaderType.Operation === this.type) {
      styles.push('operation-loading');
    }
    return styles;
  }

  // #region Private

  /**
   * @ignore
   */
  private manageLoader = (action: SdkHttpLoaderAction) => {
    this.active = action.active;
    this.type = action.type;
    this.cdr.detectChanges();
  };

  // #endregion

  // #region Getters

  /**
   * @ignore
   */
  private get sdkHttpLoaderService(): SdkHttpLoaderService { return this.injectable(SdkHttpLoaderService) }

  // #endregion

}
