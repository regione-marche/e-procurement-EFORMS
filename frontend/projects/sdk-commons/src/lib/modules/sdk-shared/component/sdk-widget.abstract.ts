import { ChangeDetectorRef, Directive, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { isObject } from 'lodash-es';
import { Observable } from 'rxjs';

import { SdkLayoutMenuTabsMessageService } from '../../sdk-layout-menu-tabs/sdk-layout-menu-tabs-messages.service';
import { SdkRefreshService } from '../../sdk-update/sdk-refresh.service';
import { SdkAbstractView } from './sdk-view.abstract';

@Directive()
export abstract class SdkAbstractWidget<X> extends SdkAbstractView implements OnInit, OnDestroy {

    /**
     * Observable con la configurazione
     */
    @Input('config') public config$: Observable<X>;

    constructor(protected inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Abstract

    /**
     * Metodo invocato appena disponibile l'oggetto Config
     */
    protected abstract onConfig(config: X): void;

    // #endregion

    // #region Hooks

    override ngOnInit(): void {
        if (isObject(this.config$)) {
            this.addSubscription(this.config$.subscribe(this.manageConfig));
        }

        super.ngOnInit();
    }

    override ngOnDestroy(): void { super.ngOnDestroy() }

    // #endregion

    // #region Protected

    protected refreshBreadcrumbs = () => {
        this.sdkRefreshService.emit(true);
    }

    protected getRefreshBreadcrumbsSubject = (cb: (v: boolean) => void) => {
        return this.sdkRefreshService.on(cb);
    }

    // #endregion

    // #region Getters

    private get sdkRefreshService(): SdkRefreshService { return this.injectable(SdkRefreshService) }

    protected get sdkLayoutMenuTabs(): SdkLayoutMenuTabsMessageService { return this.injectable(SdkLayoutMenuTabsMessageService) }

    // #endregion

    // #region Private

    private manageConfig = (config: X) => { this.onConfig({ ...config }) }

    // #endregion

}
