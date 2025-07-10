import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { IDictionary, SdkLoggerService } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, each, head, isEmpty, isFinite, isObject, join, merge } from 'lodash-es';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import {
  SdkTableColumn,
  SdkTableConfig,
  SdkTableDataResult,
  SdkTableFilterConfig,
  SdkTableMessages,
  SdkTablePageable,
  SdkTableRowDto,
  SdkTableSortDescriptor,
  SdkTableSortType,
  SdkTableState,
} from '../domains/sdk-table.config.domain';
import { SdkTableDefaults } from './sdk-table.defaults';
import { SdkTableCellDropdownActionsIconViewerComponent } from './cell-viewer/cell-dropdown-actions-icon-viewer/sdk-table-cell-dropdown-actions-icon-viewer.component';

@Component({
  selector: 'sdk-table',
  templateUrl: 'sdk-table.component.html',
  styleUrls: ['sdk-table.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTableComponent implements OnInit, AfterViewInit, OnDestroy {

  @HostBinding('class') styles = 'sdk-table-element';

  @Input('config') config$: Observable<SdkTableConfig>;

  @Input('reset') reset$: Observable<boolean>;

  @ViewChild('table') table: Table;

  @ViewChild('tableContainerRef') _tableContainerRef: ElementRef;

  // Lista di sottoscrizioni
  private _subs: Array<Subscription> = new Array();

  // Oggetto configurazione griglia
  private _config: SdkTableConfig;

  // Oggetto che rappresenta lo stato della griglia
  public _gridState: SdkTableState;

  // Oggetto con i messaggi in lingua
  private _messages: SdkTableMessages;

  public columns: Array<SdkTableColumn>;

  public dataItems: Array<SdkTableRowDto>;

  public totalRecords: number = 0;

  public loading: boolean = false;

  public sortField: string;
  public sortOrder: number;

  private currentSkip: number = 0;

  private _filterConfig: SdkTableFilterConfig;
  private _filterConfigSub: BehaviorSubject<SdkTableFilterConfig> = new BehaviorSubject(null);

  private _showCurrentPageReport: boolean = false;
  private _showCurrentRecordsReport: boolean = false;

  public currentRecordStatus: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(private cdr: ChangeDetectorRef, private inj: Injector) { }

  ngAfterViewInit(): void {

  }

  // #region Hooks

  public ngOnInit(): void {
    this.initTableConfig();
  }

  public ngOnDestroy(): void {
    this.unsubscribeAll();
    this.destroyDatasource();
  }

  // #endregion

  // #region Public

  /**
   * 
   * @param index 
   * @param column 
   */
  public trackByField(index: number, column: SdkTableColumn): string | number { return isObject(column) ? column.field : index }

  /**
   * Ritorna la configurazione per la paginazione
   * 
   * @param config 
   */
  public pageable(config: SdkTableConfig): boolean | any {
    return isObject(config) && isObject(config.pageable) ? config.pageable : config.pageable === true;
  }

  /**
   * Ritorna la configurazione per la paginazione
   * 
   * @param config 
   */
  public pageSizes(config: SdkTableConfig): boolean | any {
    if (isObject(config) && isObject(config.pageable)) {
      return (config.pageable as SdkTablePageable).pageSizes;
    }

    return SdkTableDefaults.pageSizes;
  }

  /**
   * Ritorna true se la paginazione e' abilitata, false altrimenti
   * 
   * @param config 
   */
  public paginationEnabled(config: SdkTableConfig): boolean {
    return isObject(config) && (isObject(config.pageable) || config.pageable === true);
  }

  /**
   * Ritorna la dimensione di pagina
   * 
   * @param config 
   */
  public pageSize(config: SdkTableConfig): number {
    if (this.pageable(config)) {
      return isObject(config) && isFinite(config.pageSize) ? config.pageSize : SdkTableDefaults.pageSize;
    }

    return SdkTableDefaults.maxPageSize;
  }

  public loadPage(event: LazyLoadEvent): void {
    //event.first = First row offset
    //event.rows = Number of rows per page
    //event.sortField = Field name to sort in single sort mode
    //event.sortOrder = Sort order as number, 1 for asc and -1 for dec in single sort mode
    //multiSortMeta: An array of SortMeta objects used in multiple columns sorting. Each SortMeta has field and order properties.
    //filters: Filters object having field as key and filter value, filter matchMode as value
    //globalFilter: Value of the global filter if available
    this.loading = true;
    this.cdr.markForCheck();
    this.logger.info('event >>>', event);
    let sortObj: SdkTableSortDescriptor = {
      field: event.sortField ? event.sortField : this.sortField,
      dir: this.getSortDesc(event.sortOrder)
    };
    const skip: number = this.config.pageable == null || this.config.pageable === false ? 0 : event.first;
    const take: number = this.config.pageable == null || this.config.pageable === false ? 0 : event.rows;
    let state: SdkTableState = {
      skip,
      take,
      sort: [
        sortObj
      ]
    };
    if (this.gridState != null && this.gridState.filter != null) {
      this.gridState = {
        filter: this.gridState.filter,
        ...state
      };
    } else {
      this.gridState = state;
    }
    setTimeout(() => {
      if (skip != this.currentSkip) {
        // scroll to top
        this.scrollToTop();
      }

      this.currentSkip = skip;
      this.config.datasource.query(this.gridState);
    });
  }

  /**
   * Ritorna se la tabella e' filtrabile
   * 
   * @param config 
   */
  public filterable(config: SdkTableConfig): boolean {
    if (isObject(config)) {
      return config.filterable === true;
    }
    return SdkTableDefaults.filerable;
  }

  public manageFilterOutput(filter: IDictionary<any>): void {
    if (this.loading === false) {
      this.loading = true;
      this.cdr.markForCheck();
      let currentState = cloneDeep(this.gridState);
      currentState = {
        ...currentState,
        filter
      };
      this.gridState = currentState;
      setTimeout(() => this.config.datasource.query(this.gridState));
    }
  }

  public getColClass(col: SdkTableColumn, rowData: any): string {
    let classes: Array<string> = new Array();

    if (col.class != null) {
      classes.push(col.class);
    }

    if (rowData._class != null) {
      classes.push(rowData._class);
    }

    return join(classes, ' ');
  }

  public checkFrozenEnable(column: SdkTableColumn): boolean {
    let freeze: boolean = column.viewer.type === SdkTableCellDropdownActionsIconViewerComponent;
    return freeze;
  }

  // #endregion

  // #region Private

  private initDatasource(): void {
    this._subs.push(this.config.datasource.result$.subscribe(this.manageResult));
    this._subs.push(this.config.datasource.refresh$.subscribe(this.manageDatasourceRefresh));
  }

  private destroyDatasource(): void {
    this.zone.runOutsideAngular(() => {
      try {
        this._config.datasource.$destroy();
      } catch (e) { }
    })
  }

  private unsubscribeAll(): void {
    this.zone.runOutsideAngular(() => {
      each(this._subs, one => {
        try { one.unsubscribe() } catch (e) { }
      });
    })
  }

  private initTableConfig(): void {
    if (isObject(this.config$)) {
      this._subs.push(this.config$
        .subscribe(this.manageGridConfig))
    }
    if (isObject(this.reset$)) {
      this._subs.push(this.reset$.subscribe(this.manageReset))
    }
  }

  private initializeButtons(): void {
    let collectionRipple: HTMLCollection = document.getElementsByClassName('p-ripple');
    if (collectionRipple != null && collectionRipple != undefined && collectionRipple.length > 0) {
      for (let i = 0; i < collectionRipple.length; i++) {
        let ariaLabel: string = '';
        if (i == 0) {
          ariaLabel = this.translate.instant('primeng.firstPage');
        }
        if (i == 1) {
          ariaLabel = this.translate.instant('primeng.prevPage');
        }
        if (i == 2) {
          ariaLabel = this.translate.instant('primeng.nextPage');
        }
        if (i == 3) {
          ariaLabel = this.translate.instant('primeng.lastPage');
        }
        collectionRipple[i].setAttribute('aria-label', ariaLabel);
      }
    }
    var divElem: any = document.querySelectorAll('.p-paginator');
    if (divElem != null && divElem != undefined && divElem.length !== 0) {
      var inputElements = divElem[0].querySelectorAll('input');
      if (inputElements != null && inputElements != undefined && inputElements.length > 0) {
        for (let i = 0; i < inputElements.length; i++) {
          let title: string = '';
          if (i == 0) {
            title = this.translate.instant('primeng.currentPage');
          }
          if (i == 1) {
            title = this.translate.instant('primeng.pageSummary');
          }
          inputElements[i].setAttribute('title', title);
        }
      }
    }
  }

  private manageGridConfig = (config: SdkTableConfig): void => {
    this.destroyDatasource();

    this.config = undefined;

    if (isObject(config)) {
      this.config = { ...config };

      this.messages = merge(this.defaultMessages, this.config.messages);

      this._showCurrentPageReport = this.config.showCurrentPageReport;
      this._showCurrentRecordsReport = this.config.showCurrentRecordsReport;
      this.initColumns();
      this.initSort();
      this.initDatasource();
      this.initFilter();
    }

    this.cdr.markForCheck();
  }

  private initColumns(): void {
    this.columns = new Array();
    if (!isEmpty(this.config.columns)) {
      this.columns = [...this.config.columns];
    }
  }

  private initSort(): void {
    this.sortField = head(this.config.sort).field;
    this.sortOrder = this.getSortNumber(head(this.config.sort).dir);
  }

  private manageResult = (result: SdkTableDataResult) => {
    if (isObject(result)) {
      this.loading = true;
      this.cdr.markForCheck();

      if (isFinite(result.total)) {
        this.totalRecords = result.total;
      }

      this.dataItems = !isEmpty(result.data) ? [...result.data] : [];
      this._showCurrentPageReport = this._showCurrentPageReport && !isEmpty(result.data);
      this.loading = false;
      this.cdr.markForCheck();
      this.updateCurrentRecordStatus();
      this.initializeButtons();
    }
  }

  private getSortNumber(sortDesc: SdkTableSortType): number {
    return sortDesc === 'asc' ? 1 : -1;
  }

  private getSortDesc(sortNumber: number): SdkTableSortType {
    return sortNumber === 1 ? 'asc' : 'desc';
  }

  private manageReset = (reset: boolean) => {
    if (reset === true && isObject(this.table)) {
      this.reset();
    }
  }

  private manageDatasourceRefresh = (refresh: boolean) => {
    if (refresh === true && isObject(this.table)) {
      this.reset();
    }
  }

  private initFilter() {
    if (isObject(this.config.filter)) {
      this.filterConfig = this.config.filter;
    }
  }

  private reset() {
    this.table._sortField = this.sortField;
    this.table._sortOrder = this.table.defaultSortOrder;
    this.table._multiSortMeta = null;
    this.table.tableService.onSort(null);

    this.table.filteredValue = null;
    this.table.filters = {};

    this.table.first = 0;
    this.table.firstChange.emit(this.table.first);

    if (this.table.lazy) {
      this.table.onLazyLoad.emit(this.createLazyLoadMetadata());
    }
    else {
      this.table.totalRecords = (this.table._value ? this.table._value.length : 0);
    }
    this.scrollToTop();
    this.cdr.detectChanges();
  }

  private createLazyLoadMetadata(): any {
    return {
      first: this.table.first,
      rows: this.table.virtualScroll ? this.table.rows * 2 : this.table.rows,
      sortField: this.table.sortField,
      sortOrder: this.table.sortOrder,
      filters: this.table.filters,
      globalFilter: this.table.filters && this.table.filters['global'] ? (<any>this.table.filters['global']).value : null,
      multiSortMeta: this.table.multiSortMeta
    };
  }

  private scrollToTop(): void {
    if (this.tableContainer != null) {
      this.tableContainer.scrollIntoView();
    }
  }

  private updateCurrentRecordStatus(): void {
    const message: string = this.translate.instant(this.currentRecordsReport, {
      first: (this.totalRecords > 0) ? this.table.first + 1 : 0,
      last: Math.min(this.table.first + this.table.rows, this.totalRecords),
      totalRecords: this.totalRecords
    });

    this.currentRecordStatus.next(message);
  }

  // #endregion

  // #region Getters

  public get config(): SdkTableConfig { return this._config }

  public get gridState(): SdkTableState { return this._gridState }

  public get messages(): SdkTableMessages { return this._messages }

  public get filterConfig(): SdkTableFilterConfig { return this._filterConfig }

  public get filterConfigSub(): BehaviorSubject<SdkTableFilterConfig> { return this._filterConfigSub }

  private get defaultMessages(): SdkTableMessages { return SdkTableDefaults.messages }

  private get zone(): NgZone { return this.inj.get(NgZone) }

  private get tableContainer(): HTMLElement { return this._tableContainerRef.nativeElement }

  protected get logger(): SdkLoggerService { return this.inj.get(SdkLoggerService) }

  public get showCurrentPageReport(): boolean { return this._showCurrentPageReport }

  public get currentPageReport(): string { return this.messages.currentPageReport }

  public get showCurrentRecordsReport(): boolean { return this._showCurrentRecordsReport }

  public get currentRecordsReport(): string { return this.messages.currentRecordsReport }

  private get translate(): TranslateService { return this.inj.get(TranslateService) }

  // #endregion

  // #region Setters

  public set config(value: SdkTableConfig) { this._config = value; this.cdr.markForCheck() }

  public set gridState(value: SdkTableState) { this._gridState = value; this.cdr.markForCheck() }

  public set messages(value: SdkTableMessages) { this._messages = value; this.cdr.markForCheck() }

  public set filterConfig(value: SdkTableFilterConfig) { this._filterConfig = cloneDeep(value); this._filterConfigSub.next(this._filterConfig); this.cdr.markForCheck(); }

  // #endregion
}
