import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import {
  IDictionary,
  SdkAbstractWidget,
  SdkBreadcrumbsMessageService,
  SdkStateMap
} from '@maggioli/sdk-commons';
import { SdkBreadcrumbConfig, SdkBreadcrumbItem } from '@maggioli/sdk-controls';
import { SdkLayoutBreadcrumbsCollapseService } from '@maggioli/sdk-widgets';
import { isArray, join, size } from 'lodash-es';
import { Subject } from 'rxjs';

@Component({
  selector: 'layout-breadcrumbs-widget',
  templateUrl: `layout-breadcrumbs.widget.html`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LayoutBreadcrumbsWidget
  extends SdkAbstractWidget<any>
  implements OnInit, OnDestroy
{
  @HostBinding('class') classNames = `sdk-layout-breadcrumbs`;

  public configSub: Subject<SdkBreadcrumbConfig> = new Subject();
  public config: IDictionary<any>;
  // true se si vuole nascondere il pulsante di menu tabs e triggerare il collapse, false altrimenti
  public menuTabsState: boolean = false;
  public breadcrumbsCollapseService: SdkLayoutBreadcrumbsCollapseService =
    inject(SdkLayoutBreadcrumbsCollapseService);

  private _breadcrumbsValues: Array<SdkBreadcrumbItem> = new Array();
  private _state: SdkStateMap;
  private _breadcrumbsService: SdkBreadcrumbsMessageService = inject(
    SdkBreadcrumbsMessageService
  );
  private _breadcrumbs: Array<SdkBreadcrumbItem>;

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #region Hooks

  protected onInit(): void {
    this.initBreadcrumbsBaseValue();
    this.addSubscription(
      this.disableMenuTabsService$.subscribe((menuTabsState: boolean) => {
        if (this.menuTabsState != menuTabsState) {
          this.markForCheck(() => {
            this.menuTabsState = menuTabsState;
            this.menuTabsState
              ? this.breadcrumbsCollapseService.collapse()
              : this.breadcrumbsCollapseService.expand();
          });
        }
      })
    );
  }

  protected onAfterViewInit(): void {
    this.init();
  }

  protected onDestroy(): void {}

  protected onConfig(config: IDictionary<any>): void {
    if (config != null) {
      this.config = config;
    }
  }

  protected onUpdateState(state: boolean): void {
    this.updateBreadcrumbsConfig();
  }

  // #endregion

  // #region Private

  private init(): void {
    this.addSubscription(this._breadcrumbsService.on(this.onData));
  }

  private onData = (values: Array<SdkBreadcrumbItem>) => {
    if (values != null) {
      this._breadcrumbsValues = [...this._breadcrumbs, ...values];
    } else {
      this._breadcrumbsValues = [];
    }
    this.updateBreadcrumbsConfig();
  };

  private updateBreadcrumbsConfig(): void {
    let breadcrumbsConfig: SdkBreadcrumbConfig = {
      items:
        isArray(this._breadcrumbsValues) && size(this._breadcrumbsValues) > 0
          ? [...this._breadcrumbsValues]
          : [],
      disabled: true
    };
    this.configSub.next(breadcrumbsConfig);
  }

  private initBreadcrumbsBaseValue(): void {
    this._breadcrumbs = [
      {
        code: 'eforms',
        label: 'BREADCRUMBS.EFORMS'
      }
    ];
  }

  // #endregion

  // #region Public

  public getClasses(): string {
    let classes: Array<string> = [
      'sdk-layout-header',
      'sdk-layout-breadcrumbs-container'
    ];

    return join(classes, ' ');
  }

  // #endregion
}
