import {
    AfterViewInit,
    ChangeDetectorRef,
    Directive,
    EventEmitter,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { isEmpty, isObject } from 'lodash-es';
import { Observable } from 'rxjs';

import { SdkAbstractView } from './sdk-view.abstract';

@Directive()
export abstract class SdkAbstractComponent<X, Y, Z> extends SdkAbstractView implements OnInit, OnDestroy, AfterViewInit {

    /**
     * Observable con la configurazione
     */
    @Input('config') public config$: Observable<X>;

    /**
     * Observable con i dati di inout
     */
    @Input('data') public data$: Observable<Y>;

    /**
     * EventEmitter con l'output
     */
    @Output('output') public output$ = new EventEmitter<Z>();

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Abstract

    /**
     * Metodo invocato appena disponibile l'oggetto Config
     */
    protected abstract onConfig(config: X): void;

    /**
     * Metodo invocato appena disponibile l'oggetto Data
     */
    protected abstract onData(data: Y): void;

    /**
     * Metodo invocato dopo l'emit di un output
     */
    protected abstract onOutput(data: Z): void;

    // #endregion

    // #region Hooks

    override ngOnInit(): void {
        if (isObject(this.config$)) {
            this.addSubscription(this.config$.subscribe(this.manageConfig));
        }

        if (isObject(this.data$)) {
            this.addSubscription(this.data$.subscribe(this.manageData));
        }

        super.ngOnInit();
    }

    override ngOnDestroy(): void { super.ngOnDestroy() }

    override ngAfterViewInit(): void { super.ngAfterViewInit() }

    // #endregion

    // #region Protected

    protected emitOutput = (output: Z): void => {
        if (this.output$) { this.output$.emit(output); this.onOutput(output) }
    }

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

    // #region Getters

    // #endregion

    // #region Private

    private manageConfig = (config: X) => { this.onConfig(config) }

    private manageData = (data: Y) => { this.onData(data) }

    // #endregion

}
