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
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { cloneDeep, isEmpty, isObject, join } from 'lodash-es';
import { of, Subscription } from 'rxjs';

import { SdkModalConfig, SdkModalOutput } from '../../sdk-modal.domain';

/**
 * Componente per renderizzare un modale
 */
@Component({
  selector: 'sdk-modal',
  templateUrl: './sdk-modal.component.html',
  styleUrls: ['./sdk-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkModalComponent<X, Y, Z> extends SdkAbstractComponent<SdkModalConfig<X, Y, Z>, void, SdkModalOutput<Z>> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkModalConfig<X, Y, Z>;
  /**
   * @ignore
   */
  private componentSelector: string;
  /**
   * @ignore
   */
  private componentConfig: X;
  /**
   * @ignore
   */
  private componentInput: Y;
  /**
   * @ignore
   */
  public width: number = 55;
  /**
   * @ignore
   */
  public focusContent: boolean;
  /**
   * @ignore
   */
  public modalOpened: boolean = false;

  /**
   * @ignore
   */
  private openSubjectSubscription: Subscription;

  /**
   * @ignore
   */
  @ViewChild('panel') _panel: ElementRef;

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
  protected onDestroy(): void {
    this.unsubscribeOpenSubject();
    this.closeModal();
  }

  /**
   * @ignore
   */
  protected onConfig(config: SdkModalConfig<X, Y, Z>): void {
    this.markForCheck(() => {
      if (isObject(config)) {
        this.unsubscribeOpenSubject();
        this.config = config;

        this.width = this.config.width || 55;
        this.focusContent = this.config.focusContent ?? true;

        this.componentSelector = config.component;
        this.componentConfig = config.componentConfig;
        this.componentInput = config.componentInput;

        this.openSubjectSubscription = this.config.openSubject.subscribe((data: boolean) => {
          (data === true) ? this.openModal() : this.closeModal();
        });

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
  protected onOutput(_data: SdkModalOutput<Z>): void { this.closeModal() }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public backdropClick(): void {
    this.manageCloseModal();
  }

  /**
   * @ignore
   */
  public classList(config: SdkModalConfig<X, Y, Z>): string {
    let classes: Array<string> = ['sdk-modal-container'];

    if (isObject(config) && isEmpty(config.classList) === false) {
      classes = [...classes, ...config.classList];
    }

    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public manageCloseModal(): void {
    this.closeModal();
    this.emitOutput({ code: this.config.code, close: true });
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private openModal(): void {
    this.markForCheck(() => {
      this.modalOpened = true;
      let body: HTMLElement = document.body;
      if (body != null && body.classList.contains('modal-open') === false) {
        body.classList.add('modal-open');
      }
    });
    setTimeout(() => this.loadWidget());
  }

  /**
   * @ignore
   */
  private closeModal(): void {
    this.markForCheck(() => {
      this.modalOpened = false;
      let body: HTMLElement = document.body;
      if (body != null && body.classList.contains('modal-open') === true) {
        body.classList.remove('modal-open');
      }
    });
  }

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
      let component = document.createElement(this.componentSelector) as NgElement & WithProperties<SdkAbstractComponent<X, Y, Z>>;
      if (isObject(this.componentConfig)) {
        component.config$ = of(cloneDeep(this.componentConfig));
      }
      if (isObject(this.componentInput)) {
        component.data$ = of(cloneDeep(this.componentInput));
      }
      this.panel.appendChild(component);
      component.addEventListener('output', this.onComponentOutput);
      if (this.focusContent) {
        this.panel.focus();
      }
    }
  }

  /**
   * @ignore
   */
  private onComponentOutput = (data: CustomEvent) => {
    let result = data.detail;
    this.closeModal();
    this.emitOutput(
      {
        code: this.config.code,
        data: result
      }
    );
  }

  /**
   * @ignore
   */
  private unsubscribeOpenSubject(): void {
    if (isObject(this.openSubjectSubscription)) {
      this.openSubjectSubscription.unsubscribe();
    }
  }

  // #endregion

}
