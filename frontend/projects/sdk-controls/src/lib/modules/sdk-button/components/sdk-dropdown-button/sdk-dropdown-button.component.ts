import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnInit,
  ViewChild,
} from '@angular/core';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, isEmpty, isObject, join } from 'lodash-es';
import { SplitButton } from 'primeng/splitbutton';

import {
  SdkDropdownButtonData,
  SdkDropdownButtonInput as SdkDropdownButtonConfig,
  SdkDropdownButtonOutput,
} from '../../sdk-button.domain';


/**
 * Componente per renderizzare un dropdown button
 */
@Component({
  selector: 'sdk-dropdown-button',
  templateUrl: './sdk-dropdown-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkDropdownButtonComponent extends SdkAbstractComponent<SdkDropdownButtonConfig, void, SdkDropdownButtonOutput> implements OnInit {


  /**
   * @ignore
   */
  @ViewChild('splitButton') public splitButton: SplitButton;

  /**
   * @ignore
   */
  @ViewChild('sdkDropdownButton') public _sdkDropdownButton: ElementRef;

  /**
   * @ignore
   */
  public config: SdkDropdownButtonConfig;

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
  protected onAfterViewInit(): void {
    this.setAriaExpanded(false);
    this.addSubscription(this.splitButton.menu.onShow.subscribe(() => {
      this.setAriaExpanded(true);
    }));
    this.addSubscription(this.splitButton.menu.onHide.subscribe(() => {
      this.setAriaExpanded(false);
    }));
  }

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
      each(this.config.dropdownData, (one: SdkDropdownButtonData) => {
        one.label = this.translateService.instant(one.label, one.labelParams);
        one.command = this.onItemClick;
      });
      this.isReady = true;
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

  // #region Private

  /**
   * @ignore
   */
  private setAriaExpanded(value: boolean) {
    if (value)
      this.sdkDropdownButton.getElementsByClassName('p-splitbutton-menubutton')[0].ariaExpanded = 'true';
    else
      this.sdkDropdownButton.getElementsByClassName('p-splitbutton-menubutton')[0].ariaExpanded = 'false';
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public onPrimaryButtonClick(_event: MouseEvent): void {
    let obj: SdkDropdownButtonOutput = { code: this.config.code, label: this.config.label, provider: this.config.provider };
    this.emitOutput(obj);
  }

  /**
   * @ignore
   */
  public onItemClick = (event: any): void => {
    if (event.item) {
      let obj: SdkDropdownButtonOutput = { ...event.item };
      delete obj.command;
      this.emitOutput(obj);
    }
  }

  /**
   * @ignore
   */
  public getTranslatedLabel(label: string, labelParams: IDictionary<any>): string {
    if (!isEmpty(label)) {
      return this.translateService.instant(label, labelParams);
    }
    return label;
  }

  /**
   * @ignore
   */
  public getClasses(config: SdkDropdownButtonConfig): string {
    if (isObject(config)) {
      let classes: Array<string> = new Array();
      if (config.look) {
        if (config.look === 'flat') {
          classes.push('sdk-button-flat');
        } else if (config.look === 'outline') {
          classes.push('sdk-button-outline');
        }
      }
      return join(classes, ' ');
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public getIcon(icon: string): string {
    if (!isEmpty(icon)) {
      return icon;
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public get sdkDropdownButton(): HTMLElement {
    return isObject(this._sdkDropdownButton) ? this._sdkDropdownButton.nativeElement : undefined;
  }

  // #endregion

}
