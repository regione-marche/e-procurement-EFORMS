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

import { SdkSidebarConfig, SdkSidebarOutput } from '../../sdk-sidebar.domain';

/**
 * Componente per renderizzare una sidebar
 */
@Component({
  selector: 'sdk-sidebar',
  templateUrl: './sdk-sidebar.component.html',
  styleUrls: ['./sdk-sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkSidebarComponent extends SdkAbstractComponent<SdkSidebarConfig, void, SdkSidebarOutput> implements OnInit, AfterViewInit, OnDestroy {

  /**
   * @ignore
   */
  public config: SdkSidebarConfig;
  /**
   * @ignore
   */
  private componentSelector: string;

  /**
   * @ignore
   */
  private componentConfig: any;
  /**
   * @ignore
   */
  private componentInput: any;

  /**
   * @ignore
   */
  public position: string = 'right';
  /**
   * @ignore
   */
  public width: number = 250;
  /**
   * @ignore
   */
  public focusContent: boolean;

  /**
   * @ignore
   */
  private openSubjectSubscription: Subscription;

  /**
   * @ignore
   */
  public sidebarOpened: boolean = false;

  /**
   * @ignore
   */
  @ViewChild('sidebar') _sidebar: ElementRef;

  /**
   * @ignore
   */
  @ViewChild('sidebarContent') _sidebarContent: ElementRef;

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
    this.closeSidebar();
  }

  /**
   * @ignore
   */
  protected onConfig(config: SdkSidebarConfig): void {

    this.markForCheck(() => {
      if (isObject(config)) {
        this.unsubscribeOpenSubject();

        this.config = config;

        this.position = this.config.position || 'right';
        this.width = this.config.width || 300;
        this.focusContent = this.config.focusContent ?? true;

        this.componentSelector = config.component;
        this.componentConfig = config.componentConfig;
        this.componentInput = config.componentInput;

        this.openSubjectSubscription = this.config.openSubject.subscribe((data: boolean) => {
          (data === true) ? this.openSidebar() : this.closeSidebar();
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
  protected onOutput(_data: SdkSidebarOutput): void { this.closeSidebar(); }

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
    this.closeSidebar();
    this.emitOutput({ code: this.config.code });
  }

  /**
   * @ignore
   */
  public classList(config: SdkSidebarConfig, position: string): string {
    let classes: Array<string> = ['sdk-sidebar-container', position];

    if (isObject(config) && isEmpty(config.classList) === false) {
      classes = [...classes, ...config.classList];
    }

    return join(classes, ' ');
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private get sidebarContent(): HTMLElement {
    return this._sidebarContent.nativeElement;
  }

  /**
  * @ignore
  */
  private openSidebar(): void {
    this.markForCheck(() => {
      this.sidebarOpened = true;
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
  private closeSidebar(): void {
    this.markForCheck(() => {
      this.sidebarOpened = false;
      let body: HTMLElement = document.body;
      if (body != null && body.classList.contains('modal-open') === true) {
        body.classList.remove('modal-open');
      }
    });
  }

  /**
   * @ignore
   */
  private loadWidget(): void {
    if (!isEmpty(this.componentSelector)) {
      let component = document.createElement(this.componentSelector) as NgElement & WithProperties<any>;
      if (isObject(this.componentConfig)) {
        component.config$ = of(cloneDeep(this.componentConfig));
      }
      if (isObject(this.componentInput)) {
        component.data$ = of(cloneDeep(this.componentInput));
      }
      this.sidebarContent.appendChild(component);
      component.addEventListener('output', this.onComponentOutput);
      if (this.focusContent) {
        this.sidebarContent.focus();
      }
    }
  }

  /**
   * @ignore
   */
  private onComponentOutput = (data: CustomEvent) => {
    let result = data.detail;
    this.closeSidebar();
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
