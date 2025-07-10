import {
  AfterViewInit,
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
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { isEmpty, isObject, join } from 'lodash-es';
import { OverlayPanel } from 'primeng/overlaypanel';

import { SdkBasicButtonInput } from '../../../sdk-button/sdk-button.domain';
import { SdkOverlayPanelConfig } from '../../sdk-overlay-panel.domain';

/**
 * Componente per renderizzare un overlay panel
 */
@Component({
  selector: 'sdk-overlay-panel',
  templateUrl: './sdk-overlay-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkOverlayPanelComponent extends SdkAbstractComponent<SdkOverlayPanelConfig, void, void> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkOverlayPanelConfig;
  /**
   * @ignore
   */
  private componentSelector: string;

  /**
   * @ignore
   */
  public openButton: SdkBasicButtonInput;

  /**
   * @ignore
   */
  @ViewChild('panel') _panel: ElementRef;

  /**
   * @ignore
   */
  @ViewChild('op') op: OverlayPanel;

  // #endregion

  // #region Constructor

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  // #endregion

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
  protected onConfig(config: SdkOverlayPanelConfig): void {
    this.markForCheck(() => {
      if (isObject(config)) {
        this.config = config;
        this.openButton = this.config.openButton;
        this.componentSelector = config.component;
        this.isReady = true;
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
  protected onOutput(_data: void): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public toggle(event: any) {
    this.op.toggle(event);
  }

  /**
   * @ignore
   */
  public onShowPanel(): void {
    this.loadWidget();
  }

  /**
   * @ignore
   */
  public onHidePanel(): void {
    setTimeout(() => this.removeWidget(), 500);
  }

  /**
   * @ignore
   */
  public getButtonTranslatedLabel(label: string, labelParams: IDictionary<any>): string {
    if (!isEmpty(label)) {
      return this.translateService.instant(label, labelParams);
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public getButtonTranslatedTitle(title: string, label?: string, labelParams?: IDictionary<any>): string {
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
  public getButtonClasses(config: SdkBasicButtonInput, status: boolean = false): string {
    if (isObject(config)) {
      let classes: Array<string> = new Array();
      if (config.look) {
        if (config.look === 'flat') {
          classes.push('sdk-button-flat');
        } else if (config.look === 'outline') {
          classes.push('sdk-button-outline');
        }
      }

      if (status == true) {
        classes.push('label-status');
      }

      return join(classes, ' ');
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public getButtonIcon(config: SdkBasicButtonInput): string {
    if (isObject(config) && config.icon) {
      return config.icon;
    }
    return undefined;
  }

  /**
   * @ignore
   */
  public getStyle(): IDictionary<any> {
    if (this.config.width != null) {
      return {
        width: this.config.width
      };
    }
    return {};
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private get panel(): HTMLElement {
    return this._panel.nativeElement;
  }

  /**
   * @ignore
   */
  private loadWidget(): void {
    if (!isEmpty(this.componentSelector)) {
      let component = document.createElement(this.componentSelector) as NgElement & WithProperties<any>;
      this.panel.appendChild(component);
    }
  }

  /**
   * @ignore
   */
  private removeWidget(): void {
    while (this.panel.firstChild) {
      this.panel.removeChild(this.panel.firstChild);
    }
  }

  // #endregion

}
