import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild,
} from '@angular/core';
import {
    IDictionary,
    SdkBusinessAbstractWidget,
    SdkProviderService,
    SdkRouterService,
    SdkStoreService,
    UserProfile,
} from '@maggioli/sdk-commons';
import { SdkButtonGroupInput, SdkButtonGroupOutput, SdkDialogConfig, SdkMessagePanelService, SdkMessagePanelTranslate } from '@maggioli/sdk-controls';
import { SdkTableConfig } from '@maggioli/sdk-table';
import { isEmpty, isObject, map as mapArray } from 'lodash-es';
import { BehaviorSubject, Observable, Observer, Subject, catchError, map, mergeMap, throwError } from 'rxjs';

import { HttpErrorResponse } from '@angular/common/http';
import { ResponseListaDTO, WLogEventiDTO } from '../../model/eventi/eventi.model';
import { ValoreTabellato } from '../../model/lib.model';
import { TabellatiCacheService } from '../../services/tabellati/tabellati-cache.service';
import { UltimiAccessiService } from '../../services/ultimi-accessi.service';
import { ProtectionUtilsService } from '../../utils/protection-utils.service';
import { SdkWidgetsConstants } from '../../sdk-widgets.constants';

@Component({
    templateUrl: `sdk-ultimi-accessi.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkUltimiAccessiComponent extends SdkBusinessAbstractWidget<void> implements OnInit, OnDestroy {

    // #region Variables

    @HostBinding('class') classNames = `sdk-ultimi-accessi-section`;

    @ViewChild('messages') _messagesPanel: ElementRef;

    @ViewChild('infoBox') _infoBox: ElementRef;

    public config: any = {};
    public buttonsSubj: BehaviorSubject<SdkButtonGroupInput>;
    public configSub = new BehaviorSubject<SdkTableConfig>(null);
    public resetTable: Subject<boolean> = new Subject();
    public dialogConfigObs: Observable<SdkDialogConfig>;

    private userProfile: UserProfile;
    private buttons: SdkButtonGroupInput;
    private valoriTabellati: IDictionary<Array<ValoreTabellato>>;
    public listaUltimiAccessi: Array<WLogEventiDTO>;

    // #endregion

    constructor(inj: Injector, cdr: ChangeDetectorRef) {
        super(inj, cdr);
    }

    // #region Hooks

    protected onInit(): void {

        this.addSubscription(this.store.select(SdkWidgetsConstants.USER_PROFILE_SELECT).subscribe((userProfile: UserProfile) => {
            this.userProfile = userProfile;
        }));

        this.loadButtons();
    }

    protected onAfterViewInit(): void {
        this.loadTabellati().pipe(
            map(this.elaborateTabellati),
            mergeMap(this.loadUltimiAccessi),
            map(this.elaborateListaUltimiAccessi),
            map(() => this.checkInfoBox())
        ).subscribe();
    }

    protected onDestroy(): void { }

    protected onConfig(config: any): void {
        if (isObject(config)) {
            this.markForCheck(() => {
                this.config = { ...config };
                this.isReady = true;
            });
        }
    }

    protected onUpdateState(state: boolean): void { }

    // #endregion

    // #region Getters

    private get store(): SdkStoreService { return this.injectable(SdkStoreService) }

    private get provider(): SdkProviderService { return this.injectable(SdkProviderService) }

    private get sdkMessagePanelService(): SdkMessagePanelService { return this.injectable(SdkMessagePanelService) }

    private get tabellatiCacheService(): TabellatiCacheService { return this.injectable(TabellatiCacheService) }

    private get protectionUtilsService(): ProtectionUtilsService { return this.injectable(ProtectionUtilsService) }

    private get routerService(): SdkRouterService { return this.injectable(SdkRouterService) }

    private get gestioneEventiService(): UltimiAccessiService { return this.injectable(UltimiAccessiService) }

    // #endregion

    // #region Public

    public onButtonClick(button: SdkButtonGroupOutput): void {

        if (isObject(button) && isEmpty(button.provider) === false) {
            let data: IDictionary<any> = {
                buttonCode: button.code,
                messagesPanel: this.messagesPanel,
                setUpdateState: this.setUpdateState
            };

            if (button.code === 'back') {
                this.back();
            } else {
                this.provider.run(button.provider, data).subscribe();
            }

        }
    }

    public getLivelloEvento(livelloEvento: number): string {
        const livello = this.valoriTabellati['LivelloEvento']?.find(tabellato => tabellato.codice === livelloEvento.toString());
        return livello ? livello.descrizione : 'Sconosciuto';
        // MAPPING:
        // 1 --> Info
        // 2 --> Avviso
        // 3 --> Errore
    }

    // #endregion

    // #region Private

    private loadUltimiAccessi = (): Observable<ResponseListaDTO<Array<WLogEventiDTO>>> => {
        return this.gestioneEventiService.getUltimiAccessi()
            .pipe(
                catchError((error: HttpErrorResponse, _caught: Observable<any>) => {
                    let err: ResponseListaDTO<any> = error.error;
                    if (err != null && err.messages != null && err.messages.length > 0) {
                        let messages: Array<SdkMessagePanelTranslate> = mapArray(err.messages, (one: string) => {
                            let message: SdkMessagePanelTranslate = {
                                message: `SDK-COMMONS.VALIDATORS.${one}`
                            };
                            return message;
                        });
                        this.sdkMessagePanelService.showError(this.messagesPanel, messages);
                    }
                    return throwError(() => error);
                })
            );
    }

    private elaborateListaUltimiAccessi = (result: ResponseListaDTO<Array<WLogEventiDTO>>) => {
        this.listaUltimiAccessi = result.response
        this.markForCheck();
    }


    private back(): Observable<IDictionary<any>> {
        this.routerService.navigateToPage('home-page');
        return new Observable((ob: Observer<IDictionary<any>>) => {
            ob.next(undefined);
            ob.complete();
        });
    }

    private get messagesPanel(): HTMLElement {
        return isObject(this._messagesPanel) ? this._messagesPanel.nativeElement : undefined;
    }

    private loadTabellati = (): Observable<IDictionary<Array<ValoreTabellato>>> => {
        return this.tabellatiCacheService.getValoriTabellati(SdkWidgetsConstants.RICERCA_EVENTI_TABELLATI);
    }

    private elaborateTabellati = (result: IDictionary<Array<ValoreTabellato>>) => {
        this.valoriTabellati = result;
    }

    private get infoBox(): HTMLElement {
        return isObject(this._infoBox) ? this._infoBox.nativeElement : undefined;
    }

    private checkInfoBox(): void {
        if (!isEmpty(this.config.infoBox)) {
            this.sdkMessagePanelService.clear(this.infoBox);
            this.sdkMessagePanelService.showInfoBox(this.infoBox, {
                message: this.config.infoBox
            });
        }
    }

    private loadButtons(): void {
        this.buttons = {
            buttons: this.protectionUtilsService.checkButtonsProtection(this.config.body.buttons, this.userProfile.configurations)
        };

        this.buttonsSubj = new BehaviorSubject(this.buttons);
    }

    // #endregion

}