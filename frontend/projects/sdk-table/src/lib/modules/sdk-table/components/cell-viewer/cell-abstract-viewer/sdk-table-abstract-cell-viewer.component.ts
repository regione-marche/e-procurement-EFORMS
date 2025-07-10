import {
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    Injector,
    Input,
    NgZone,
    OnDestroy,
    OnInit,
    Output,
    Type,
} from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { forEach, get, isEmpty, isFunction } from 'lodash-es';
import { Subscription } from 'rxjs';

import { SdkTableCellViewer, SdkTableColumn, SdkTableRowDto } from '../../../sdk-table.domains';

@Directive()
export abstract class SdkAbstractCellViewer implements OnInit, OnDestroy, SdkTableCellViewer {

    private _dataItem: SdkTableRowDto;
    private _columnConfig: SdkTableColumn;
    private _rowIndex: number;
    private _params: IDictionary<any>;

    private _events: EventEmitter<any> = new EventEmitter<any>();

    public get dataItem(): SdkTableRowDto { return this._dataItem; }
    public get columnConfig(): SdkTableColumn { return this._columnConfig; }
    public get rowIndex(): number { return this._rowIndex; }
    public get params(): any { return this._params; }
    public get events(): EventEmitter<any> { return this._events; }

    public get fieldValue() {
        const fieldValue: any = get(this.dataItem, get(this.columnConfig, 'field'));
        const formatFn: (value: any) => any = get(this.columnConfig, 'formatFn');
        return formatFn && isFunction(formatFn) ? formatFn(fieldValue) : fieldValue;
    }

    public get fieldValueTooltip() {
        const fieldValueTooltip: any = get(this.dataItem, get(this.columnConfig, 'fieldTooltip'));
        return fieldValueTooltip;
    }

    @Input('dataItem')
    public set dataItem(value: SdkTableRowDto) {
        this._dataItem = { ...value };
        this.onDataItemChange();
        this.updateData();
    }

    @Input('columnConfig')
    public set columnConfig(value: SdkTableColumn) {
        this._columnConfig = value;
        this.onColumnConfigChange();
        this.updateData();
    }

    @Input('rowIndex')
    public set rowIndex(value: number) {
        this._rowIndex = value
        this.updateData();
    }

    @Input('params')
    public set params(value: any) {
        if (isFunction(value)) {
            this._params = value(this.rowIndex, this.dataItem, this.columnConfig)
        } else {
            this._params = { ...value };
        }

        this.updateData();
    }

    @Output('events')
    public set events(value: EventEmitter<any>) {
        this._events = value;
    }

    protected subscriptions: Array<Subscription> = new Array();

    constructor(protected cdr: ChangeDetectorRef, protected zone: NgZone, protected inj: Injector) { }

    // #region Hooks

    public ngOnInit(): void { }

    public ngOnDestroy(): void { this.unsubscribeAll() }

    // #endregion

    // #region Abstract

    protected abstract onColumnConfigChange(): void;

    protected abstract onDataItemChange(): void;

    // #endregion

    // #region Private

    private unsubscribeAll(): void {
        this.zone.runOutsideAngular(() => {
            forEach(this.subscriptions, one => {
                try { one.unsubscribe(); } catch (e) { }
            });
        });
    }

    // #endregion

    // #region Protected

    protected updateData(): void { this.cdr.markForCheck() }

    protected injectable<T>(t: Type<T>) { return this.inj.get(t) }

    /**
     * @ignore
     */
    protected formatMultilineValue(val: string) {
        if (!isEmpty(val)) {
            // converto il \r in stringa vuota perche' e' solo windows che lo 
            // converto il \n con <br> per essere interpretato da html
            val = val.replace(/(?:\r\n|\r|\n)/g, '<br>');
        }
        return val;
    }

    // #endregion
}