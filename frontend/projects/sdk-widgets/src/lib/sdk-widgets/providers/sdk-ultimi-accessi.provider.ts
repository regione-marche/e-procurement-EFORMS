import { Injectable, Injector } from '@angular/core';
import {
    IDictionary,
    SdkBaseService,
    SdkProvider,
    SdkRouterService
} from '@maggioli/sdk-commons';
import { Observable, Observer, of } from 'rxjs';
import { WLogEventiDTO } from '../model/eventi/eventi.model';

export interface SdkUltimiAccessiProviderArgs extends IDictionary<any> {
    messagesPanel?: HTMLElement;
    buttonCode?: string;
    item?: WLogEventiDTO;
    setUpdateState?: Function;
}

@Injectable()
export class SdkUltimiAccessiProvider extends SdkBaseService implements SdkProvider {

    constructor(inj: Injector) {
        super(inj);
    }

    public run(args: SdkUltimiAccessiProviderArgs): Observable<IDictionary<any>> {
        this.logger.debug('SdkUltimiAccessiProviderArgs >>>', args);
        if (args.buttonCode === 'back') {
            return this.back();
        }
        return of(args);
    }

    private back(): Observable<IDictionary<any>> {
        this.routerService.navigateToPage('home-page');
        return new Observable((ob: Observer<IDictionary<any>>) => {
            ob.next(undefined);
            ob.complete();
        });
    }

    // #region Getters

    private get routerService(): SdkRouterService { return this.injectable(SdkRouterService) }

    // #endregion
}