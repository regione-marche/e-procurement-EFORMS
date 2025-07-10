import { Injector, Type } from '@angular/core';
import { IDictionary, SdkLoggerService, SdkRestHelperService } from '@maggioli/sdk-commons';
import { isObject, now } from 'lodash-es';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';
import { delay as delayOb, mergeMap } from 'rxjs/operators';

import { SdkTableDataResult, SdkTableState } from '../domains/sdk-table.config.domain';


export abstract class SdkTableDatasource {

    private _params: IDictionary<any>;

    private sub: Subscription;

    private resultSub = new BehaviorSubject<SdkTableDataResult>(null);
    public result$ = this.resultSub.asObservable();

    private refreshSub: Subject<boolean> = new Subject();
    public refresh$ = this.refreshSub.asObservable();

    constructor(protected inj: Injector, params: IDictionary<any>) {
        this.init(params);
    }

    // #region Public

    /** Metodo per la distruzione del DS - ad uso interno */
    public $destroy(): void { this.init(); if (this.sub) { this.sub.unsubscribe() }; }

    /** Metodo resettare le modofifiche - ad uso interno */
    public $resetChanges(): void { this.init(this._params); }

    public resetParamsAndChanges(): void { this.init(); }

    public query(state: SdkTableState): void {

        // this.logger.debug('query >>>', state);

        if (isObject(state)) {
            let startTime = now();

            this.fetch(state)
                .pipe(this.delay(startTime))
                .subscribe(this.emitChanges)
        }
    }

    // #endregion

    // #region Protected

    protected abstract fetchDataItems(state: SdkTableState): Observable<SdkTableDataResult>;

    protected abstract isReadyForFetch(state: SdkTableState): boolean;

    protected fetch(state: SdkTableState): Observable<SdkTableDataResult> {

        let ob = this.isReadyForFetch(state) ? this.fetchDataItems(state) : this.empty(state);

        return ob.pipe(
            mergeMap(this.ensureValidPage(state))
        );
    }

    protected injectable<T>(t: Type<T>) { return this.inj.get(t) }

    protected runSilent<T>(func: (value: T) => T, value: T): T {
        try { return func(value) } catch (err) { this.logger.error(err); return value }
    }

    protected empty(state: SdkTableState): Observable<SdkTableDataResult> { return of({ data: [], total: 0, gridState: state }) }

    // #endregion

    // #region Private

    private emitChanges = (x: any): void => this.resultSub.next(x)

    private delay(startTime: number, endTime = now()) {
        let execTime = 125 - (endTime - startTime);
        return delayOb(execTime > 0 ? execTime : 0);
    }

    private init(params?: IDictionary<any>): void {
        this._params = params || {};
    }

    private ensureValidPage = (state: SdkTableState) => (response: SdkTableDataResult): Observable<SdkTableDataResult> => {
        return isObject(response) ? of({ ...response } as SdkTableDataResult) : this.empty(state);
    }

    private refresh(): void {
        this.refreshSub.next(true);
    }

    // #endregion

    // #region Getters 

    public get rest(): SdkRestHelperService { return this.injectable(SdkRestHelperService) }

    public get logger(): SdkLoggerService { return this.injectable(SdkLoggerService) }

    public get params(): IDictionary<any> { return this._params }

    // #endregion

    // #region Setters

    public set params(value: IDictionary<any>) { this._params = value; this.refresh(); }

    // #endregion
}
