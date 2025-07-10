import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    InjectionToken,
    Injector,
    NgZone,
    OnDestroy,
    OnInit,
    Type,
} from '@angular/core';
import { forEach } from 'lodash-es';
import { Observable, Subscription, distinctUntilChanged } from 'rxjs';

import { SdkLoggerService } from '../../sdk-logger/sdk-logger.service';
import { SdkDisableMenuTabsService } from '../../sdk-update/sdk-disable-menu-tabs.service';
import { SdkUpdateService } from '../../sdk-update/sdk-update.service';

@Directive()
export abstract class SdkAbstractView implements OnInit, OnDestroy, AfterViewInit {

    private subscriptions: Array<Subscription> = new Array();

    /**
     * Stato della pagina per la disattivazione dei componenti di navigazione
     */
    private _update: boolean;

    /**
     * Flag che indica se il componente è pronto ad essere renderizzato,
     * deve essere settato a true dalle sottoclassi
     */
    public isReady: boolean = false;

    /**
     * Id random (utilizzato ad esempio per collegare la label ad un campo di testo)
     */
    public componentRandomId: string = null;

    constructor(private _inj: Injector, private _cdr: ChangeDetectorRef) { }

    // #region Abstract

    /**
     * Metodo invocato dopo la fase di inizializzazione del componente
     */
    protected abstract onInit(): void;

    /**
     * Metodo invocato prima della deallocazione del componente
     */
    protected abstract onDestroy(): void;

    /**
     * Metodo invocato dopo la fase di render del template
     */
    protected abstract onAfterViewInit(): void;

    /**
     * Metodo invocato al cambio di stato della pagina (dettaglio -> modifica)
     * per disattivare i componenti di navigazione
     */
    protected abstract onUpdateState(state: boolean): void;

    // #endregion

    // #region Hooks

    public ngOnInit(): void {

        this.addSubscription(this.sdkUpdateService.getObservable()
            .pipe(distinctUntilChanged())
            .subscribe((value: boolean) => {
                this._update = value;
                this.onUpdateState(this._update);
            }));

        this.componentRandomId = this.generateUniqueCode();

        this.manageInit();
    }

    public ngOnDestroy(): void {
        this.unsubscribeAll();
        this.manageDestroy();
    }

    public ngAfterViewInit(): void {
        this.manageAfterViewInit();
    }

    // #endregion

    // #region Protected

    /**
     * Metodo per l'aggiunta di una sottoscrizione alla lista che verrà gestita al destroy
     */
    protected addSubscription = (sub: Subscription): void => { if (sub) { this.subscriptions.push(sub) } }

    /**
     * Metodo per il recupero di un service angular (@Injectable())
     * 
     * @param token Injectable Class
     */
    protected injectable<T>(token: Type<T> | InjectionToken<T>): T { return this._inj.get(token) }

    /**
     * Metodo per la gestione di codice che modifica lo stato del componente e necessita di un markForCheck
     *
     * @param cb Callback
     */
    protected markForCheck(cb?: () => void): void { if (cb) { cb() } this._cdr.markForCheck() }

    /**
     * Metodo per la gestione di codice che modifica lo stato del componente e necessita di un detectChanges
     *
     * @param cb Callback
     */
    protected detectChanges(cb?: () => void): void { if (cb) { cb() } this._cdr.detectChanges() }

    /**
     * Metodo per la gestione di codice da eseuire fuori dalle zone angular
     *
     * @param cb Callback
     */
    protected runOutside(cb: () => void): void { this.zone.runOutsideAngular(cb) }

    /**
     * Metodo per ritornare lo stato della pagina
     * @returns Stato della pagina
     */
    protected getUpdateState = (): boolean => {
        return this._update;
    }

    /**
     * Metodo per impostare lo stato della pagina
     * @param state Stato della pagina
     */
    protected setUpdateState = (state: boolean): void => {
        this.sdkUpdateService.emit(state);
    }

    /**
     * Metodo per generare un'id Randomico
     */
    protected generateUniqueCode(): string {
        return Math.random().toString(36).slice(2); // NOSONAR
    }

    /**
     * Metodo per impostare il menu tabs come abilitato/disabilitato
     * @param state Stato del menu tabs
     */
    protected setDisableMenutabsState = (state: boolean): void => {
        this.sdkDisableMenuTabsService.emit(state);
    }

    // #endregion

    // #region Getters

    private get sdkUpdateService(): SdkUpdateService { return this.injectable(SdkUpdateService) }

    private get sdkDisableMenuTabsService(): SdkDisableMenuTabsService { return this.injectable(SdkDisableMenuTabsService) }

    protected get logger(): SdkLoggerService { return this.injectable(SdkLoggerService) }

    protected get zone(): NgZone { return this.injectable(NgZone) }

    // #endregion

    // #region Private

    private manageInit = () => { this.onInit() }

    private manageDestroy = () => { this.onDestroy() }

    private manageAfterViewInit = () => { this.onAfterViewInit() }

    private unsubscribeAll = () => { forEach(this.subscriptions, this.unsubscribeOne) }

    private unsubscribeOne = (one: Subscription) => { try { one.unsubscribe() } catch (e) { } }

    // #endregion

    // #region Public

    public get updateStateObservable$(): Observable<boolean> {
        return this.sdkUpdateService.getObservable();
    }

    public get disableMenuTabsService$(): Observable<boolean> {
        return this.sdkDisableMenuTabsService.getObservable();
    }

    // #endregion
}
