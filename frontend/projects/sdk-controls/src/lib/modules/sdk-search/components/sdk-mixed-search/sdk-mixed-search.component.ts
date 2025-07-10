import { animate, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SdkAbstractComponent, SdkDomHandler } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, isEmpty, isObject, join, trim } from 'lodash-es';
import { SelectItem } from 'primeng/api';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';

import {
  SdkMixedSearchConfig,
  SdkMixedSearchFilterItem,
  SdkMixedSearchInput,
  SdkMixedSearchOutput,
} from '../../sdk-search.domain';


/**
 * Componente per renderizzare un campo di ricerca mixed
 */
@Component({
  selector: 'sdk-mixed-search',
  templateUrl: './sdk-mixed-search.component.html',
  styleUrls: ['./sdk-mixed-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('overlayAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scaleY(0.8)' }),
        animate('{{showTransitionParams}}')
      ]),
      transition(':leave', [
        animate('{{hideTransitionParams}}', style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SdkMixedSearchComponent extends SdkAbstractComponent<SdkMixedSearchConfig, SdkMixedSearchInput, SdkMixedSearchOutput> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  @ViewChild('inputElem') public _inputElem: ElementRef;

  /**
   * @ignore
   */
  @ViewChild('overlayElem') public _overlayElem: ElementRef;

  /**
   * @ignore
   */
  public config: SdkMixedSearchConfig;

  /**
   * @ignore
   */
  public data: string = '';

  /**
   * @ignore
   */
  public searchButtonTitle: string = 'BUTTONS.SEARCH';

  /**
   * @ignore
   */
  public selectedFilter: string;

  /**
   * @ignore
   */
  public dropdownIcon: string = 'pi pi-chevron-down';

  /**
   * @ignore
   */
  public filterList: Array<SelectItem>;

  /**
   * @ignore
   */
  private _selectedFilterObj: SelectItem;

  /**
   * @ignore
   */
  private overlayOnMouseOverSubscription: Subscription;
  /**
   * @ignore
   */
  private overlayOnMouseOutSubscription: Subscription;
  /**
   * @ignore
   */
  private insideOverlay: boolean = false;

  /**
   * @ignore
   */
  public overlayVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  /**
   * @ignore
   */
  private overlayVisibleSubscription: Subscription;

  /**
   * @ignore
   */
  private overlayVisible: boolean = false;

  /**
   * @ignore
   */
  public showTransitionOptions: string = '.12s cubic-bezier(0, 0, 0.2, 1)';
  /**
   * @ignore
   */
  public hideTransitionOptions: string = '.1s linear';

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
    this.registerEvents();
  }

  /**
   * @ignore
   */
  protected onDestroy(): void {
    this.removeClickListener();
    this.removeScrollListener();
    this.removeOverlaySubscriptions();
    this.removeOverlayVisibleSubscription();
  }

  /**
   * @ignore
   */
  protected onOutput(data: SdkMixedSearchOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkMixedSearchConfig): void {
    if (config != null) {
      this.config = { ...config };

      this.elaborateFilter();
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkMixedSearchInput): void {
    if (isObject(data)) {
      this.data = data.data;
    }
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #region Public

  /**
   * @ignore
   */
  public getClasses(initialLabel: string, config: SdkMixedSearchConfig): string {
    let classes: Array<string> = [initialLabel];

    if (!isEmpty(config.label)) {
      classes = [...classes, 'with-label'];
    }

    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public manageClick(_event: Event): void {
    if (!isEmpty(this.data)) {
      this.data = trim(this.data);
    }
    this.emitOutput({ code: this.config.code, data: this.data, filterCode: this.selectedFilter != null ? this.selectedFilter : null } as SdkMixedSearchOutput);
  }

  /**
   * @ignore
   */
  public manageDropdown(_event: Event): void {
    if (this.overlayVisible) {
      this.hideOverlay();
    } else {
      this.showOverlay();
    }
  }

  /**
   * @ignore
   */
  public get selectedFilterObj(): SelectItem {
    return this._selectedFilterObj;
  }

  /**
   * @ignore
   */
  public set selectedFilterObj(value: SelectItem) {
    this._selectedFilterObj = value;
    this.cdr.markForCheck();
  }

  /**
   * @ignore
   */
  public onOptionClick(_event: Event, item: SelectItem): void {
    if (item != null) {
      this.selectedFilter = item.value;
      this.selectedFilterObj = { ...item };
      this.config.label = this.selectedFilterObj.label;
      this.hideOverlay();
    }
  }

  /**
   * @ignore
   */
  public onOverlayAnimationStart(event: any): void {
    switch (event.toState) {
      case 'visible':
        this.adjustOverlayPosition();
        break;

      case 'void':
        break;
    }
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private elaborateFilter(): void {
    this.filterList = new Array();
    delete this.selectedFilter;
    if (this.config != null) {
      each(this.config.filterList, (one: SdkMixedSearchFilterItem) => {
        const selectItem: SelectItem = {
          value: one.value,
          label: this.translateService.instant(one.label)
        };
        this.filterList.push(selectItem);
        // imposto il default
        if (one.default === true) {
          this.selectedFilter = one.value;
          this.selectedFilterObj = one;
          this.config.label = this.selectedFilterObj.label;
        }
      });
    }
  }

  /**
   * @ignore
   */
  private get overlayElem(): HTMLElement {
    return this._overlayElem ? this._overlayElem.nativeElement : null;
  }

  /**
   * @ignore
   */
  private get inputElem(): HTMLInputElement {
    return this._inputElem ? this._inputElem.nativeElement : null;
  }

  /**
   * @ignore
   */
  private registerEvents(): void {
    this.logger.debug('Execute method::registerEvents');
    if (this.inputElem != null) {
      // this.addClickListener();
      this.addScrollListener();
      this.overlayVisibleSubscription = this.overlayVisible$.subscribe((visible: boolean) => {
        this.overlayVisible = visible;
      });
      this.logger.debug('registerEvents::registered 3 events');
    }
  }

  /**
   * @ignore
   */
  private addClickListener(): void {
    this.removeClickListener();
    this.zone.runOutsideAngular(() => {
      document.addEventListener('click', this.clickout, true);
    });
  }

  /**
   * @ignore
   */
  private removeClickListener(): void {
    this.zone.runOutsideAngular(() => {
      document.removeEventListener('click', this.clickout, true);
    });
  }

  /**
   * @ignore
   */
  private addScrollListener(): void {
    this.removeScrollListener()
    this.zone.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scroll, true);
    });
  }

  /**
   * @ignore
   */
  private removeScrollListener(): void {
    this.zone.runOutsideAngular(() => {
      window.removeEventListener('scroll', this.scroll, true);
    });
  }

  /**
   * @ignore
   */
  private clickout = (ev: MouseEvent) => {
    // this.logger.debug('Execute method::clickout');
    if (this.inputElem) {
      if (!this.inputElem.contains(ev.target as HTMLElement) && !this.insideOverlay) {
        this.zone.run(() => {
          this.hideOverlay();
        });
      }
    }
  }

  /**
   * @ignore
   */
  private scroll = (ev: MouseEvent) => {
    // this.logger.debug('Execute method::scroll');
    if (this.inputElem) {
      if (!this.inputElem.contains(ev.target as HTMLElement) && !this.insideOverlay) {
        this.zone.run(() => {
          this.hideOverlay();
        });
      }
    }
  }

  /**
   * @ignore
   */
  private removeOverlaySubscriptions(): void {
    if (this.overlayOnMouseOverSubscription != null) {
      this.overlayOnMouseOverSubscription.unsubscribe();
    }
    if (this.overlayOnMouseOutSubscription != null) {
      this.overlayOnMouseOutSubscription.unsubscribe();
    }
  }

  /**
   * @ignore
   */
  private showOverlay(): void {
    // this.logger.debug('Execute method::showOverlay');
    this.overlayVisible$.next(true);
    this.dropdownIcon = 'pi pi-chevron-up';
    // set listener on overlay
    setTimeout(() => {
      if (this.overlayElem != null) {
        this.removeOverlaySubscriptions();
        this.overlayOnMouseOverSubscription = fromEvent(this.overlayElem, 'mouseover').subscribe(this.overlayMouseOver)
        this.overlayOnMouseOutSubscription = fromEvent(this.overlayElem, 'mouseout').subscribe(this.overlayMouseOut)
      }
    });
  }

  /**
   * @ignore
   */
  private hideOverlay(): void {
    // this.logger.debug('Execute method::hideOverlay');
    this.overlayVisible$.next(false);
    this.dropdownIcon = 'pi pi-chevron-down';
  }

  /**
   * @ignore
   */
  private overlayMouseOver = (_event: Event): void => {
    this.insideOverlay = true;
  }

  /**
   * @ignore
   */
  private overlayMouseOut = (_event: Event): void => {
    this.insideOverlay = false;
  }

  /**
   * @ignore
   */
  private removeOverlayVisibleSubscription(): void {
    if (this.overlayVisibleSubscription != null) {
      this.overlayVisibleSubscription.unsubscribe();
    }
  }

  /**
   * @ignore
   */
  private adjustOverlayPosition(): void {
    if (this.inputElem != null && this.overlayElem != null) {
      SdkDomHandler.relativePosition(this.overlayElem, this.inputElem);
    }
  }

  // #endregion

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion
}
