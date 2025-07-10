import { EventEmitter, Type } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { SdkFormBuilderField } from '@maggioli/sdk-controls';

import { SdkTableDatasource } from '../services/sdk-table.abstract.datasource';

export interface SdkTableConfig {
    datasource: SdkTableDatasource;

    pageable?: boolean | SdkTablePageable;
    pageSize?: number;

    sortable?: boolean | SdkTableSortable;
    sort?: Array<SdkSortDescriptor>;

    filterable?: boolean;
    filter?: SdkTableFilterConfig;

    columns: Array<SdkTableColumn>;

    messages?: SdkTableMessages;

    /**
     * Mostra le info dei records
     */
    showCurrentRecordsReport?: boolean;
    /**
     * Mostra le info di pagina
     */
    showCurrentPageReport?: boolean;
}

export interface SdkTableColumn {
    title: string;
    field?: string;
    fieldTooltip?: string;
    fields?: Array<string>;
    bindings?: Array<SdkTableSortDescriptor>
    width?: number;
    hidden?: boolean;
    media?: SdkMediaQuery;
    resizable?: boolean;
    sortable?: boolean;
    oggettoProtezione?: string;
    formatFn?: (fieldValue: any) => any;
    class?: string;
    align?: TSdkTableCellAlign;

    viewer: {
        type: Type<SdkTableCellViewer>;
        params?: IDictionary<any> | SdkTableCellParamsProvider;
        //params?: IDictionary<any>;
        styles?: Array<string>;
    };
}

export type SdkTableCellParamsProvider = (rowIndex: number, dataItem: SdkTableRowDto, columnConfig: SdkTableColumn) => IDictionary<any>;

export type SdkMediaQuery = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type TSdkTableCellAlign = 'SX' | 'DX';

export interface SdkTablePageable {
    buttonCount?: number;
    info?: boolean
    pageSizes?: boolean | Array<number>;
    type?: 'numeric' | 'input';
}

export interface SdkTableSortable {
    allowUnsort?: boolean;
    mode?: 'single' | 'multiple';
    initialDirection?: 'asc' | 'desc';
}

export interface SdkSortDescriptor {
    field: string;
    dir?: 'asc' | 'desc';
}

export interface SdkTableRowConfig {
    dataItem: SdkTableRowDto;
    rowIndex: number;
    params: IDictionary<any>;
    events: EventEmitter<any>;
}

export interface SdkTableRowDetail extends SdkTableRowConfig {
    gridConfig: SdkTableConfig;
}

export interface SdkTableCellViewer extends SdkTableRowConfig {
    columnConfig: SdkTableColumn;
}

export interface SdkTableRowDto {
    id?: string;
    id$?: string;
}

export interface SdkTableDataResult {
    /**
     * The data that will be rendered by the Table as an array.
     */
    data: SdkTableRowDto[];
    /**
     * The total number of records that are available.
     */
    total: number;

    gridState: SdkTableState;
}

export interface SdkTableState {
    /**
     * The number of records to be skipped by the pager.
     */
    skip?: number;
    /**
     * The number of records to take.
     */
    take?: number;
    /**
     * The descriptors used for sorting.
     */
    sort?: Array<SdkTableSortDescriptor>;
    /**
     * Eventuale filtro della tabella
     */
    filter?: IDictionary<any>;
}

export interface SdkTableSortDescriptor {
    /**
     * The field that is sorted.
     */
    field: string;
    /**
     * The sort direction.
     * If no direction is set, the descriptor will be skipped during processing.
     *
     * The available values are:
     * - `asc`
     * - `desc`
     */
    dir?: SdkTableSortType;
}

export type SdkTableSortType = 'asc' | 'desc';

export interface SdkTableMessages {
    noRecords?: string;
    pagerOf?: string;
    pagerPage?: string;
    pagerItems?: string;
    pagerItemsPerPage?: string;
    clearFilters?: string;
    applyFilters?: string;
    /**
     * Informazioni di riepilogo
     * "Visualizzate da {{first}} a {{last}} di {{totalRecords}} righe"
     */
    currentRecordsReport?: string;
    /**
     * Informazioni pagina
     * "Pagina {currentPage} di {totalPages}"
     */
    currentPageReport?: string;
}

export interface SdkTableActionConfig {
    code?: string;
    performer?: SdkTableToolbarActionPerfomer;
    label?: string;
    disabled?: boolean;
    hidden?: any;
    icon?: string;
    oggettoProtezione?: string;
    oggettoProtezioneType?: string;
    /**
     * Codice per raggruppare piu' pulsanti (tipo radio buttons)
     * Questo parametro NON cambiera' l'ordine dei pulsanti contenenti lo stesso codice
     */
    buttonGroupId?: string;
    /**
     * Ad uso interno, non usare
     */
    lastItemOfGroup?: boolean;
}

export type SdkTableToolbarActionPerfomer = (selectedRow: { rowIndex: number, dataItem: SdkTableRowDto }) => any;

export interface SdkTableFilterConfig {
    filterLabel?: string;
    activeFiltersLabel?: string;
    fields?: Array<SdkFormBuilderField>;
}

export interface SdkTableIconConfig {
    activationValue?: any;
    icon?: string;
    label?: string;
    classes?: Array<string>;
}