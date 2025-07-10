import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { each, isEmpty, isString } from 'lodash-es';
import {
    SdkAutocompleteAdvancedModalAPIResponse,
    SdkAutocompleteAdvancedModalComponentColumn,
    SdkAutocompleteAdvancedModalComponentConfig,
    SdkAutocompleteAdvancedModalPageSortFilter,
    SdkAutocompleteAdvancedModalSortOrder,
    SdkAutocompleteItem,
} from '../../sdk-form.domain';

/**
 * Componente che renderizza il modale dell'autocomplete advanced
 */
@Component({
    templateUrl: `sdk-autocomplete-advanced-modal.component.html`,
    styleUrls: ['sdk-autocomplete-advanced-modal.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkAutocompleteAdvancedModalComponent extends SdkAbstractComponent<SdkAutocompleteAdvancedModalComponentConfig, void, any> implements OnInit, AfterViewInit, OnDestroy {

    // #region Variables

    /**
     * @ignore
     */
    @HostBinding('class') classNames = `sdk-autocomplete-advanced-modal`;

    /**
     * @ignore
     */
    @ViewChild('messages') _messagesPanel: ElementRef;

    /**
     * @ignore
     */
    @ViewChild('table') table: Table;

    /**
     * @ignore
     */
    public config: SdkAutocompleteAdvancedModalComponentConfig;

    /**
     * @ignore
     */
    public currentRecordStatus: BehaviorSubject<string> = new BehaviorSubject('');

    /**
     * @ignore
     */
    public results: Array<any> = [];

    /**
     * @ignore
     */
    public totalRecords: number = 0;

    /**
     * @ignore
     */
    public loading: boolean = false;

    /**
     * @ignore
     */
    public searchData: string = null;

    /**
     * @ignore
     */
    public debounce: Subject<any> = new Subject<any>();

    /**
     * @ignore
     */
    public paginationEnabled: boolean = true;

    /**
     * @ignore
     */
    private skip: number = 0;
    /**
     * @ignore
     */
    private take: number = 0;
    /**
     * @ignore
     */
    private sortField: string;
    /**
     * @ignore
     */
    private sortDirection: SdkAutocompleteAdvancedModalSortOrder;
    /**
     * @ignore
     */
    private baseSearchData: string = null;
    /**
     * @ignore
     */
    private baseFiltersCampiCollegati: IDictionary<any>;

    /**
     * @ignore
     */
    private advancedAutocompleteCampiCollegatiToAdvancedFilter: boolean;

    /**
     * @ignore
     */
    public defaultSortField: string;
    /**
     * @ignore
     */
    public defaultSortDirection: number;

    // #endregion

    /**
     * @ignore
     */
    constructor(inj: Injector, private cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    /**
     * @ignore
     */
    protected onInit(): void {
        this.addActionColumn();
        this.addSubscription(this.debounce.pipe(
            debounceTime(350),
            distinctUntilChanged())
            .subscribe((value: string) => {
                this.search(this.searchData, this.buildTablePageSortFilter());
            }));
    }

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
    protected onOutput(_data: void): void { }

    /**
     * @ignore
     */
    protected onConfig(config: SdkAutocompleteAdvancedModalComponentConfig): void {
        if (config != null) {
            this.config = { ...config };
            this.advancedAutocompleteCampiCollegatiToAdvancedFilter = this.config.advancedAutocompleteCampiCollegatiToAdvancedFilter;
            if (this.config.searchData) {
                this.baseSearchData = this.config.searchData;
            }

            if (this.config.baseFiltersCampiCollegati) {
                this.baseFiltersCampiCollegati = { ...this.config.baseFiltersCampiCollegati };
            }

            if (this.config.paginationEnabled == false) {
                this.paginationEnabled = false;
            }

            if (this.advancedAutocompleteCampiCollegatiToAdvancedFilter && this.baseFiltersCampiCollegati != null) {
                this.searchData = this.fillSearchData();
            }

            if (!isEmpty(this.config.defaultSortField)) {
                this.defaultSortField = this.config.defaultSortField;
            }

            if (!isEmpty(this.config.defaultSortDirection)) {
                this.defaultSortDirection = this.config.defaultSortDirection === 'asc' ? 1 : -1;
            } else {
                this.defaultSortDirection = 1;
            }

            this.isReady = config != null && config.columns.length > 0;
        }
    }

    /**
     * @ignore
     */
    protected onData(_data: void): void { }

    /**
     * @ignore
     */
    protected onUpdateState(state: boolean): void { }

    // #endregion

    // #region Getters

    private get translateService(): TranslateService { return this.injectable(TranslateService) }

    // #endregion

    // #region Private

    /**
     * @ignore
     */
    private get messagesPanel(): HTMLElement {
        return this._messagesPanel != null ? this._messagesPanel.nativeElement : undefined;
    }

    /**
     * @ignore
     */
    private search(detailData?: string, tablePageSortFilter?: SdkAutocompleteAdvancedModalPageSortFilter): void {
        if (this.config != null && this.config.itemsProvider != null) {
            let baseFilters: IDictionary<any> = {};
            if (this.baseFiltersCampiCollegati != null && !this.advancedAutocompleteCampiCollegatiToAdvancedFilter) {
                baseFilters = {
                    ...this.baseFiltersCampiCollegati
                };
            }
            baseFilters[this.config.code] = this.baseSearchData;
            this.config.itemsProvider(baseFilters, detailData, tablePageSortFilter, this.messagesPanel).subscribe((response: SdkAutocompleteAdvancedModalAPIResponse<any>) => {
                this.markForCheck(() => {
                    if (response != null) {
                        this.results = response.response;
                        this.totalRecords = response.totalCount;
                    }
                    this.loading = false;
                    this.updateCurrentRecordStatus();
                    this.initializeButtons();
                });
            });
        }
    }

    /**
     * @ignore
     */
    private addActionColumn(): void {
        if (this.config != null && this.config.columns.length > 0) {
            let actionColumn: SdkAutocompleteAdvancedModalComponentColumn = {
                code: 'actions',
                label: this.config.actionsLabel,
                icon: 'mgg-icons-paginator-next'
            };
            this.config.columns.push(actionColumn);
        }
    }

    /**
     * @ignore
     */
    private updateCurrentRecordStatus(): void {
        setTimeout(() => {
            const message: string = this.translateService.instant('currentRecordsReport', {
                first: (this.totalRecords > 0) ? this.table.first + 1 : 0,
                last: Math.min(this.table.first + this.table.rows, this.totalRecords),
                totalRecords: this.totalRecords
            });

            this.currentRecordStatus.next(message);
        });
    }

    /**
     * @ignore
     */
    private initializeButtons(): void {
        let collectionRipple: HTMLCollection = document.getElementsByClassName('p-ripple');
        if (collectionRipple != null && collectionRipple != undefined && collectionRipple.length > 0) {
            for (let i = 0; i < collectionRipple.length; i++) {
                let ariaLabel: string = '';
                if (i == 0) {
                    ariaLabel = this.translateService.instant('primeng.firstPage');
                }
                if (i == 1) {
                    ariaLabel = this.translateService.instant('primeng.prevPage');
                }
                if (i == 2) {
                    ariaLabel = this.translateService.instant('primeng.nextPage');
                }
                if (i == 3) {
                    ariaLabel = this.translateService.instant('primeng.lastPage');
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
                        title = this.translateService.instant('primeng.currentPage');
                    }
                    if (i == 1) {
                        title = this.translateService.instant('primeng.pageSummary');
                    }
                    inputElements[i].setAttribute('title', title);
                }
            }
        }
    }

    private fillSearchData(): string {
        let val: string = null;
        each(this.baseFiltersCampiCollegati, (value: any, key: string) => {
            if (value != null) {
                val = value;
                return false;
            }
        });

        return val;
    }

    private buildTablePageSortFilter(paginationEnabled: boolean = false): SdkAutocompleteAdvancedModalPageSortFilter {
        let config: SdkAutocompleteAdvancedModalPageSortFilter = {
            sortField: this.sortField,
            sortDirection: this.sortDirection
        };

        if (paginationEnabled === true) {
            config = {
                ...config,
                skip: this.skip,
                take: this.take
            };
        }

        return config;
    }

    // #endregion

    // #region Public

    /**
     * @ignore
     */
    public selectCell(data: any): void {
        let item: SdkAutocompleteItem = {
            ...data,
            text: this.config.entityText(data),
            _key: data[this.config.entityKey]
        };
        this.emitOutput(item);
    }

    /**
     * @ignore
     */
    public loadPage(event: LazyLoadEvent): void {
        // ci metto il setTimeout perche' viene chiamato prima dell'after view init
        // e quindi nel search non ho disponibile il messagesPanel
        setTimeout(() => {
            //event.first = First row offset
            //event.rows = Number of rows per page
            //event.sortField = Field name to sort in single sort mode
            //event.sortOrder = Sort order as number, 1 for asc and -1 for dec in single sort mode
            //multiSortMeta: An array of SortMeta objects used in multiple columns sorting. Each SortMeta has field and order properties.
            //filters: Filters object having field as key and filter value, filter matchMode as value
            //globalFilter: Value of the global filter if available
            delete this.sortField;
            delete this.sortDirection;
            this.markForCheck(() => this.loading = true);
            const skip: number = event.first;
            this.skip = skip;
            const take: number = event.rows;
            this.take = take;

            // manage sort
            if (event.sortField != null) {
                const sortField: string = event.sortField;
                this.sortField = sortField;
                const sortDirection: SdkAutocompleteAdvancedModalSortOrder = event.sortOrder == 1 ? 'asc' : 'desc';
                this.sortDirection = sortDirection;
            }

            this.search(this.searchData, this.buildTablePageSortFilter(this.paginationEnabled));
        });
    }

    /**
     * @ignore
     */
    public parseValue(value: any): string {
        if (isString(value)) {
            let val = `${value}`;

            val = super.formatMultilineValue(val);

            return val;
        }
        return value;
    }

    // #endregion
}