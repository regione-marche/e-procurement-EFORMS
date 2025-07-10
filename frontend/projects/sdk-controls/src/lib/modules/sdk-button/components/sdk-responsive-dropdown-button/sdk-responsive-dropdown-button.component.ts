import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  Type,
  ViewChild,
} from '@angular/core';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, isEmpty, isObject, join } from 'lodash-es';
import { OverlayPanel } from 'primeng/overlaypanel';
import { BehaviorSubject, of } from 'rxjs';

import {
  ESdkButtonLook,
  SdkDropdownButtonData,
  SdkDropdownButtonInput as SdkDropdownButtonConfig,
  SdkDropdownButtonOutput,
} from '../../sdk-button.domain';
import { SdkDropdownDataComponent } from '../sdk-dropdown-data/sdk-dropdown-data.component';


/**
 * Componente per renderizzare un dropdown button
 */
@Component({
  selector: 'sdk-responsive-dropdown-button',
  templateUrl: './sdk-responsive-dropdown-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkResponsiveDropdownButtonComponent extends SdkAbstractComponent<SdkDropdownButtonConfig, void, SdkDropdownButtonOutput> implements OnInit {

  /**
   * @ignore
   */
  public config: SdkDropdownButtonConfig;

  /**
   * @ignore
   */
  @ViewChild('op') public op: OverlayPanel;

  /**
   * @ignore
   */
  @ViewChild('opTarget') public opTarget: ElementRef;

  /**
   * @ignore
   */
  private baloonInputSubject: BehaviorSubject<Array<SdkDropdownButtonData>> = new BehaviorSubject(null);

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
  protected onOutput(data: SdkDropdownButtonOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkDropdownButtonConfig): void {
    this.markForCheck(() => {
      this.config = { ...config };
      if (this.config.dropdownData != null && this.config.dropdownData.length > 0) {
        each(this.config.dropdownData, (one: SdkDropdownButtonData) => {
          one.labelTradotta = this.translateService.instant(one.label, one.labelParams);
          if (one.title != null) {
            one.titleTradotto = this.translateService.instant(one.title);
          } else {
            one.titleTradotto = one.labelTradotta;
          }
          one.command = this.onItemClick;
        });
        this.baloonInputSubject.next(this.config.dropdownData);
        this.isReady = true;
      } else {
        this.logger.warn('Tutti i pulsanti all\'interno del baloon sono stati nascosti da profilo/providers quindi nascondo anche il pulsante di apertura');
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

  // #region Getters

  /**
   * @ignore
   */
  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public onItemClick = (item: SdkDropdownButtonData): void => {
    if (item) {
      let obj: SdkDropdownButtonOutput = { ...item };
      delete obj.command;
      this.emitOutput(obj);
    }
  }

  /**
   * @ignore
   */
  public getTranslatedLabel(label: string, labelParams: IDictionary<any>, look: ESdkButtonLook): string {
    if (look != null && look == 'icon') {
      return undefined;
    }
    if (!isEmpty(label)) {
      return this.translateService.instant(label, labelParams);
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public getTranslatedTitle(title: string, label?: string, labelParams?: IDictionary<any>): string {
    if (!isEmpty(title)) {
      return this.translateService.instant(title);
    } else if (!isEmpty(label)) {
      return this.translateService.instant(label, labelParams);
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public getClasses(config: SdkDropdownButtonConfig, responsive: boolean = false): string {
    if (isObject(config)) {
      let classes: Array<string> = new Array();
      classes.push('sdk-responsive-dropdown-button');
      if (config.look) {
        if (config.look === 'flat') {
          classes.push('sdk-button-flat');
        } else if (config.look === 'outline') {
          classes.push('sdk-button-outline');
        } else if (config.look == 'icon') {
          classes.push('sdk-button-icon');
        }
      }
      if (config.buttonClasses != null) {
        classes = [...classes, ...config.buttonClasses];
      }

      if (responsive) {
        classes.push('sdk-button-responsive');
      } else {
        classes.push('sdk-button-no-responsive');
      }

      return join(classes, ' ');
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public getIcon(config: SdkDropdownButtonConfig): string {
    if (isObject(config) && config.icon) {
      return config.icon;
    }
    return undefined;
  }

  // #endregion

  // #region BALOON

  /**
   * @ignore
   */
  private _baloonResponsive: any;

  /**
   * @ignore
   */
  public get baloonResponsive(): any {
    return this._baloonResponsive;
  }

  /**
   * @ignore
   */
  private _baloonDim: string = 'large';

  /**
   * @ignore
   */
  public get baloonDim(): string {
    return this._baloonDim;
  }

  /**
   * @ignore
   */
  private _baloonPos: string = 'up';

  /**
   * @ignore
   */
  public get baloonPos(): string {
    return this._baloonPos;
  }

  /**
   * @ignore
   */
  private _baloonFrameTop: number = 0;

  /**
   * @ignore
   */
  public get baloonFrameTop(): number {
    return this._baloonFrameTop;
  }

  /**
   * @ignore
   */
  private _baloonFrameBottom: number = 0;

  /**
   * @ignore
   */
  public get baloonFrameBottom(): number {
    return this._baloonFrameBottom;
  }

  /**
   * @ignore
   */
  public baloonComponent(): Type<any> {
    return SdkDropdownDataComponent;
  }

  /**
   * @ignore
   */
  public baloonInput() {
    return () => {
      return this.baloonInputSubject;
    };
  }

  /**
   * @ignore
   */
  public baloonOutput() {
    return (item: SdkDropdownButtonData) => {
      if (item.command) {
        item.command(item);
      }
    };
  }

  /**
   * @ignore
   */
  public baloonDisabled(disabled: boolean) {
    return () => {
      try {
        return of(disabled);
      } catch (err) {
        console.error(err);
        return of(false);
      }
    };
  }

  //#endregion

}
