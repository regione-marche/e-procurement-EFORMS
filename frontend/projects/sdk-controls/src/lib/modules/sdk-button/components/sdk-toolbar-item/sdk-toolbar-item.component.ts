import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { get, isObject } from 'lodash-es';
import { of } from 'rxjs';

import { SdkControlsRepo } from '../../../../sdk-controls.repo';
import { SdkLoaderContainerRefDirective } from '../../../sdk-view/container-ref/sdk-loader.container-ref.directive';
import { SdkToolbarButton, SdkToolbarButtonOutput } from '../../sdk-button.domain';

/**
 * Componente per renderizzare un item della toolbar
 */
@Component({
  selector: 'sdk-toolbar-item',
  templateUrl: './sdk-toolbar-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkToolbarItemComponent extends SdkAbstractComponent<SdkToolbarButton, void, SdkToolbarButtonOutput> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  @ViewChild(SdkLoaderContainerRefDirective) private ref: SdkLoaderContainerRefDirective;

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  /**
   * @ignore
   */
  protected onInit(): void { this.isReady = true }

  /**
   * @ignore
   */
  protected onOutput(data: SdkToolbarButtonOutput): void { }

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
  protected onConfig(config: SdkToolbarButton): void {
    setTimeout(() => this.loadWidget(config));
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
  private loadWidget(config: SdkToolbarButton): void {
    if (isObject(config)) {

      let viewContainerRef = this.containerRef();

      let component = this.component(config);

      viewContainerRef.clear();

      let componentRef = viewContainerRef.createComponent(component);

      (componentRef.instance as any).config$ = of(config);

      this.addSubscription(
        (componentRef.instance as any).output$.subscribe(this.emitOutput)
      )

      this.detectChanges();

    }
  }

  /**
   * @ignore
   */
  private containerRef(): ViewContainerRef {
    return isObject(this.ref) ? this.ref.viewContainerRef : undefined;
  }

  /**
   * @ignore
   */
  private component(config: SdkToolbarButton): Type<SdkAbstractComponent<any, any, any>> {

    let component = get(SdkControlsRepo, config.widgetCode);

    return component;

  }

}
