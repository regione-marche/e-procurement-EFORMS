import { ChangeDetectorRef, Component, ElementRef, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { each, find, isEmpty, isFunction, join } from 'lodash-es';
import { BehaviorSubject, fromEvent, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import {
  SdkAdvancedSearchCategoryConfig,
  SdkAdvancedSearchConfig,
  SdkAdvancedSearchInput,
  SdkAdvancedSearchItemResult,
  SdkAdvancedSearchOutput,
} from '../../sdk-search.domain';


/**
 * Componente per renderizzare un campo di ricerca avanzata
 */
@Component({
  selector: 'sdk-advanced-search',
  templateUrl: './sdk-advanced-search.component.html',
  styleUrls: ['./sdk-advanced-search.component.scss']
})
export class SdkAdvancedSearchComponent extends SdkAbstractComponent<SdkAdvancedSearchConfig, SdkAdvancedSearchInput, SdkAdvancedSearchOutput> implements OnInit, OnDestroy {

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
  public config: SdkAdvancedSearchConfig;
  /**
   * @ignore
   */
  public overlayVisible$: BehaviorSubject<boolean> = new BehaviorSubject(false);
  /**
   * @ignore
   */
  public searchDone: boolean = false;
  /**
   * @ignore
   */
  public searchedData: Array<SdkAdvancedSearchItemResult>;
  /**
   * @ignore
   */
  public isSearching: boolean = false;
  /**
   * @ignore
   */
  public selectedCategory: SdkAdvancedSearchCategoryConfig;

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
  private debounce: Subject<string> = new Subject<string>();
  /**
   * @ignore
   */
  private debounceTime: number = 350;
  /**
   * @ignore
   */
  private focusSubscription: Subscription;
  /**
   * @ignore
   */
  private inputSubscription: Subscription;

  /**
   * @ignore
   */
  private minCharacterSearch: number = 2;

  /**
   * @ignore
   */
  public canBeFocused: boolean = true;

  /**
   * @ignore
   */
  constructor(inj: Injector, private cdr: ChangeDetectorRef) { super(inj, cdr) }

  /**
   * @ignore
   */
  protected onInit(): void {
    this.addSubscription(
      this.debounce.pipe(
        debounceTime(this.debounceTime)
      ).subscribe((value: string) => {
        this.logger.debug('Execute method::debounce', value);
        this.searchData(value);
      }));
  }

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
    this.removeInputElemSubscriptions();
  }

  /**
   * @ignore
   */
  protected onOutput(_data: SdkAdvancedSearchOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkAdvancedSearchConfig): void {
    if (config != null) {
      this.reset();
      this.config = { ...config };
      if (this.config.categories != null && this.config.categories.length > 0 && this.config.categories[0] != null) {
        this.config.categories[0].selected = true;
        this.selectedCategory = {
          ...this.config.categories[0]
        };
      }
      this.minCharacterSearch = this.config.minCharacterSearch || 2;
      this.isReady = true;
    }
  }

  /**
   * @ignore
   */
  protected onData(_data: SdkAdvancedSearchInput): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void {
    setTimeout(() => {
      this.markForCheck(() => this.canBeFocused = state == false);
    });
  }

  // #region Public

  /**
   * @ignore
   */
  public getClasses(initialLabel: string, config: SdkAdvancedSearchConfig): string {
    let classes: Array<string> = [initialLabel];

    if (config != null && !isEmpty(config.label)) {
      classes = [...classes, 'with-label'];
    }

    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public manageCategoryClick(category: SdkAdvancedSearchCategoryConfig, index: number): void {
    if (category == null || (category != null && category.selected === true)) {
      return;
    }

    this.clearSearch();
    this.clearInput();

    each(this.config.categories, (one: SdkAdvancedSearchCategoryConfig, idx: number) => {
      one.selected = false;
      if (idx === index) {
        one.selected = true;
        this.selectedCategory = {
          ...one
        };
      }
    });
  }

  /**
   * @ignore
   */
  public clickItem(item: SdkAdvancedSearchItemResult): void {
    this.logger.debug('Execute method::clickItem');
    if (item != null && this.selectedCategory != null && isFunction(this.selectedCategory.selectItemFunction)) {
      this.selectedCategory.selectItemFunction(item);
      this.hideOverlay();
      this.clearSearch();
      this.clearInput();
      delete this.searchedData;
    } else {
      this.logger.error('Select item function not defined');
    }
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private get inputElem(): HTMLInputElement {
    return this._inputElem ? this._inputElem.nativeElement : null;
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
  private registerEvents(): void {
    this.logger.debug('Execute method::registerEvents');
    if (this.inputElem != null) {
      this.addClickListener();
      this.addScrollListener();
      this.focusSubscription = fromEvent(this.inputElem, 'focus').subscribe(this.focus);
      this.inputSubscription = fromEvent(this.inputElem, 'input').subscribe(this.input);
      this.logger.debug('registerEvents::registered 4 events');
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
  private removeScrollListener(): void {
    this.zone.runOutsideAngular(() => {
      window.removeEventListener('scroll', this.scroll, true);
    });
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
  private focus = (_event: Event): void => {
    if(this.getUpdateState() == true){
      return;
    }
    this.logger.debug('Execute method::focus');
    this.showOverlay();
  }

  /**
   * @ignore
   */
  private input = (event: InputEvent): void => {
    const searchValue: string = (event.target as any).value;
    this.debounce.next(searchValue);
  }

  /**
   * @ignore
   */
  private showOverlay(): void {
    // this.logger.debug('Execute method::showOverlay');
    this.overlayVisible$.next(true);
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
  private searchData(value: string): void {
    this.logger.debug('Execute method::searchData', value);
    this.isSearching = true;
    this.cdr.markForCheck();
    if (value == null || isEmpty(value)) {
      this.clearSearch();
      this.isSearching = false;
      this.cdr.markForCheck();
    } else {
      value = value.trim();
      if (value.length >= this.minCharacterSearch) {
        if (this.config.categories != null && this.config.categories.length > 0) {
          const selected: SdkAdvancedSearchCategoryConfig = find(this.config.categories, (one: SdkAdvancedSearchCategoryConfig) => one.selected === true);
          if (selected != null && isFunction(selected.searchFunction)) {
            selected.searchFunction(value).subscribe((result: Array<SdkAdvancedSearchItemResult>) => {
              if (result != null) {
                if (this.inputElem.value != null && !isEmpty(this.inputElem.value)) {
                  this.searchedData = result;
                }
              }
              this.isSearching = false;
              this.cdr.markForCheck();
            });
          } else {
            this.logger.error('Search function not defined');
            this.isSearching = false;
            this.cdr.markForCheck();
          }
        }
      } else {
        this.isSearching = false;
        this.cdr.markForCheck();
      }
    }
  }

  /**
   * @ignore
   */
  private clearSearch(): void {
    this.logger.debug('Execute method::clearSearch');
    delete this.searchedData;
  }

  /**
   * @ignore
   */
  private clearInput(): void {
    this.logger.debug('Execute method::clearInput');
    if (this.inputElem != null) {
      this.inputElem.value = null;
    }
    this.isSearching = false;
    this.cdr.markForCheck();
  }

  /**
   * @ignore
   */
  private removeInputElemSubscriptions(): void {
    if (this.focusSubscription != null) {
      this.focusSubscription.unsubscribe();
    }
    if (this.inputSubscription != null) {
      this.inputSubscription.unsubscribe();
    }
  }

  /**
   * @ignore
   */
  private reset(): void {
    this.clearSearch();
    this.clearInput();
    delete this.searchedData;
    this.removeClickListener();
    this.removeScrollListener();
    this.removeOverlaySubscriptions();
    this.removeInputElemSubscriptions();
  }

  // #endregion

  // #region Getters

  // #endregion
}
