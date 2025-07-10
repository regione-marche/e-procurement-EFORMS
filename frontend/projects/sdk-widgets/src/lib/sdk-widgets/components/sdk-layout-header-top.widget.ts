import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    IDictionary,
    SdkAbstractWidget,
    SdkProviderService,
    SdkRouterService,
    SdkStoreService,
    SdkTestataProfileMessageService,
    UserProfile,
} from '@maggioli/sdk-commons';
import {
    SdkAdvancedSearchCategoryConfig,
    SdkAdvancedSearchConfig,
    SdkDropdownButtonData,
    SdkDropdownButtonInput,
    SdkDropdownButtonOutput,
    SdkMenuConfig,
    SdkMenuItem,
    SdkModalConfig,
    SdkOverlayPanelConfig,
    SdkSidebarConfig,
    SdkSidebarOutput,
    SdkSimpleSearchInput,
} from '@maggioli/sdk-controls';
import { cloneDeep, each, filter, get, isEmpty, isObject } from 'lodash-es';
import { BehaviorSubject, PartialObserver, Subject, Subscription, of } from 'rxjs';

import { SdkLayoutMenuHeaderUtilsService } from './sdk-layout-header-menu-utils.service';
import { SdkResponsiveMenuSidebarConfig } from './sdk-responsive-menu-sidebar.widget';

@Component({
    templateUrl: `sdk-layout-header-top.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutHeaderTopWidget extends SdkAbstractWidget<any> implements OnInit, OnDestroy, AfterViewInit {

    public currentEnte: string = '';
    public currentProfile: string;
    public profileSub: BehaviorSubject<SdkDropdownButtonInput> = new BehaviorSubject(null);
    public dropdownConfigVisible: boolean = false;
    public headerLogoSmall: string;
    public modalConfigObs: Subject<SdkModalConfig<any, void, any>> = new Subject();
    public overlayConfigSub: Subject<SdkOverlayPanelConfig> = new Subject();
    public logo: string;
    public searchData = of({ data: '' } as SdkSimpleSearchInput);
    public titoloApplicativo: string;
    public titoloModulo: string;
    public advancedSearchConfigSubj: BehaviorSubject<SdkAdvancedSearchConfig>;
    public isLogoSlug: boolean = false;
    public logoSlug: string;
    public logoDescription: string;
    public canBeFocused: boolean = true;
    public sidebarConfigObs: BehaviorSubject<SdkSidebarConfig> = new BehaviorSubject(null);
    public menuVisible: boolean = false;

    private config: IDictionary<any>;
    private userProfile: UserProfile;
    private modalConfig: SdkModalConfig<any, void, any>;
    private overlayConfig: SdkOverlayPanelConfig;
    private stazioneAppaltanteInfo: any;
    private enteSubscription: Subscription;
    private listaStazioniAppaltantiCountSubscription: Subscription;
    private stazioniAppaltantiCount: number;
    private _dropdownConfig: SdkDropdownButtonInput;
    private menuConfig: SdkMenuConfig;
    private bottomMenuConfig: SdkMenuConfig;
    private sidebarConfig: SdkSidebarConfig;

    constructor(inj: Injector, private cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { this.init(); }

    protected onAfterViewInit(): void {
        this.addSubscription(this.testataProfile.on(this.onTestataProfile));

        this.addSubscription(
            this.store.select('userProfile').subscribe(this.onData)
        );
    }

    protected onDestroy(): void {
        this.unsubscribeSA();
        this.unsubscribeListaSACount();
    }

    protected onConfig(config: IDictionary<any>): void {
        if (config != null) {
            this.unsubscribeSA();
            this.enteSubscription = this.store.select('saInfo').subscribe(this.onSaInfoData);
            this.unsubscribeListaSACount();
            this.listaStazioniAppaltantiCountSubscription = this.store.select('stazioniAppaltantiCount').subscribe(this.onListaStazioniAppaltantiCountData)

            this.config = cloneDeep(config);

            this.menuVisible = get(this.config, 'menuVisible');
            this.menuConfig = get(this.config, 'menu');
            this.bottomMenuConfig = get(this.config, 'bottomMenu');

            this.logo = this.config.logo;
            this.headerLogoSmall = this.config.headerLogoSmall;
            this.isLogoSlug = this.config.logoSlug != null;
            this.logoSlug = this.config.logoSlug;
            this.titoloApplicativo = this.config.titoloApplicativo;
            this.titoloModulo = this.config.titoloModulo;

            if (isObject(get(this.config, 'profileDropdownButton'))) {
                this.setDropdownConfig(get(this.config, 'profileDropdownButton'));
            }

            if (isObject(get(this.config, 'sidebarMenuConfig'))) {
                this.sidebarConfig = get(this.config, 'sidebarMenuConfig');
                this.sidebarConfig.openSubject = new Subject();
                this.sidebarConfigObs.next(this.sidebarConfig);
            }

            this.modalConfig = {
                code: 'modal',
                title: '',
                openSubject: new Subject()
            };
            setTimeout(() => {
                this.modalConfigObs.next(this.modalConfig);
            });
        }
    }

    protected onUpdateState(state: boolean): void {
        setTimeout(() => {
            if (isObject(this.dropdownConfig)) {
                let config = cloneDeep(this.dropdownConfig);
                config = {
                    ...config,
                    disabled: state
                };
                this.setDropdownConfig(config);
            }
            if (this.overlayConfig != null) {
                // aggiorno le info con lo stato
                let overlayConfig: SdkOverlayPanelConfig = this.setOverlayPanelState(state);
                // invio il contesto all'overlay panel
                this.sendContextToOverlayPanel(overlayConfig);
            }
            this.markForCheck(() => this.canBeFocused = state == false);
        });
    }

    // #endregion

    // #region Public

    public onProfileClick(button: SdkDropdownButtonOutput): void {
        if (isObject(button) && isEmpty(button.provider) === false) {
            this.addSubscription(
                this.provider.run(button.provider, {
                    fake: true,
                    modalConfig: this.modalConfig,
                    modalConfigObs: this.modalConfigObs,
                    config: this.config,
                    userProfile: this.userProfile
                }).subscribe(this.onProfileResponse)
            )
        }
    }

    public getShortEnte(ente: string): string {
        if (ente == null) {
            return null;
        }

        return ente.length > 40 ? ente.substring(0, 40) + '...' : ente;
    }

    public onLogoClick(): void {
        if (this.isLogoSlug) {
            this.sdkRouterService.navigateToPage(this.logoSlug);
        }
    }

    public openSidebar(): void {
        this.sidebarConfig.openSubject.next(true);
    }

    public onSidebarOutput(output: SdkSidebarOutput): void {
        if (output != null && output.data != null) {
            let item: SdkMenuItem = output.data;

            if (isEmpty(item.slug) && isEmpty(item.externalLink) && isEmpty(item.modalComponent) && !isEmpty(item.additionalProvider)) {
                // Caso particolare in cui non voglio navigare ma eseguire solamente l'additionalProvider
                // Lo tratto come observable (es. chiamata REST)
                this.provider.run(item.additionalProvider).subscribe();
            } else {
                if (!isEmpty(item.additionalProvider)) {
                    let providerResult: string = this.provider.run(item.additionalProvider);
                    if (providerResult != null) {
                        item.externalLink = providerResult;
                    }
                }

                if (!isEmpty(item.slug)) {
                    if (isObject(item.additionalParams)) {
                        this.sdkRouterService.navigateToPage(item.slug, item.additionalParams);
                    } else {
                        this.sdkRouterService.navigateToPage(item.slug);
                    }

                } else if (!isEmpty(item.externalLink)) {
                    window.open(item.externalLink, '_blank');
                } else if (!isEmpty(item.modalComponent)) {
                    // Open modal
                    this.modalConfig.component = item.modalComponent;
                    this.modalConfig.componentConfig = cloneDeep(get(this.config, item.modalComponentConfig));
                    this.modalConfigObs.next(this.modalConfig);
                    this.modalConfig.openSubject.next(true);
                }
            }
        }
    }

    // #endregion

    // #region Private

    private init(): void {
        this.markForCheck(() => {
            this.currentProfile = '';
            this.logoDescription = this.config.logoDescription != null ? this.config.logoDescription : 'logo';
            this.isReady = true;
        });
    }

    private onData = (userProfile: UserProfile) => {
        if (userProfile != null) {
            this.userProfile = userProfile;
            if (isObject(this.userProfile) && isObject(this.userProfile.configurations)) {
                this.currentProfile = get(this.userProfile.configurations, 'nome');
            }
            setTimeout(() => this.markForCheck(() => {
                if (isObject(this.dropdownConfig)) {
                    let config = cloneDeep(this.dropdownConfig);
                    config = {
                        ...config,
                        labelParams: {
                            value: userProfile ? `${userProfile.nome} ${userProfile.cognome}` : ''
                        }
                    };
                    this.setDropdownConfig(config);
                    this.dropdownConfigVisible = true;
                }
            }));
        } else {
            this.markForCheck(() => { this.dropdownConfigVisible = false });
        }

        this.loadMenu();

        if (this.config.searchField) {
            const searchField: SdkAdvancedSearchConfig = { ...this.config.searchField };
            searchField.categories = this.sdkLayoutMenuHeaderUtilsService.checkAdvancedSearch(searchField.categories, this.userProfile);
            each(searchField.categories, (one: SdkAdvancedSearchCategoryConfig) => {
                if (one.searchFunctionProvider) {
                    one.searchFunction = this.provider.run(one.searchFunctionProvider, {
                        code: 'SEARCH',
                        stazioneAppaltante: this.stazioneAppaltanteInfo,
                        userProfile: this.userProfile
                    });
                }
                if (one.selectItemFunctionProvider) {
                    one.selectItemFunction = this.provider.run(one.selectItemFunctionProvider, {
                        code: 'SELECT',
                        stazioneAppaltante: this.stazioneAppaltanteInfo,
                        userProfile: this.userProfile
                    });
                }
            });
            if (this.advancedSearchConfigSubj == null) {
                this.advancedSearchConfigSubj = new BehaviorSubject(searchField);
            } else {
                this.advancedSearchConfigSubj.next(searchField);
            }
        }

        if (get(this.config, 'messagesOverlay') != null) {

            let overlayConfig: SdkOverlayPanelConfig = cloneDeep(get(this.config, 'messagesOverlay'));
            let overlayConfigStatus: string = get(this.config, 'messageOverlayStatus');
            if (overlayConfigStatus != null) {
                // se esiste un check status allora eseguo il provider
                this.provider.run(overlayConfigStatus).subscribe(
                    (count: number) => {
                        this.overlayConfig = overlayConfig;

                        if (count > 0) {
                            this.overlayConfig.status = true;
                            this.overlayConfig.statusValue = '!';
                        }
                        // aggiorno le info con lo stato
                        let overlayConfigEdited: SdkOverlayPanelConfig = this.setOverlayPanelState(this.getUpdateState());
                        // invio il contesto all'overlay panel
                        this.sendContextToOverlayPanel(overlayConfigEdited);
                    },
                    (error: Error) => {
                        this.logger.error('Errore durante il recupero dello stato dell\'overlay panel');
                    }
                );
            } else {
                // altrimenti invio il contesto direttamente all'overlay panel
                this.overlayConfig = overlayConfig;
                // aggiorno le info con lo stato
                let overlayConfigEdited: SdkOverlayPanelConfig = this.setOverlayPanelState(this.getUpdateState());
                // invio il contesto all'overlay panel
                this.sendContextToOverlayPanel(overlayConfigEdited);
            }
        }
    }

    private onTestataProfile = (data: boolean) => {
        setTimeout(() => this.markForCheck(() => {
            this.dropdownConfigVisible = data;
        }));
    }

    private onSaInfoData = (saInfo: any) => {
        this.markForCheck(() => {
            if (saInfo != null) {
                this.stazioneAppaltanteInfo = saInfo;
                this.currentEnte = get(saInfo, 'nome');
            } else {
                this.currentEnte = '';
            }
        });
    }

    private onProfileResponse: PartialObserver<IDictionary<any>> = {
        next: (res: IDictionary<any>) => { this.logger.info('onProfileResponse', res) },
        error: (err: Error) => { this.logger.error('onProfileResponse', err) },
    }

    private onListaStazioniAppaltantiCountData = (stazioniAppaltantiCount: number) => {
        this.stazioniAppaltantiCount = stazioniAppaltantiCount;
    }

    private unsubscribeSA(): void {
        if (this.enteSubscription != null) {
            this.enteSubscription.unsubscribe();
        }
    }

    private unsubscribeListaSACount(): void {
        if (this.listaStazioniAppaltantiCountSubscription != null) {
            this.listaStazioniAppaltantiCountSubscription.unsubscribe();
        }
    }

    private sendContextToOverlayPanel(overlayConfig: SdkOverlayPanelConfig): void {
        this.logger.debug('Context sent with update state', this.getUpdateState());
        this.overlayConfigSub.next(overlayConfig)
    }

    private setOverlayPanelState(state: boolean): SdkOverlayPanelConfig {
        if (this.overlayConfig != null) {

            let overlayConfig = cloneDeep(this.overlayConfig);
            let openButton = overlayConfig.openButton;
            openButton = {
                ...openButton,
                disabled: state
            };
            overlayConfig.openButton = openButton;

            return overlayConfig;
        }
        return null;
    }

    private loadMenu(): void {
        if (this.menuVisible) {
            if (this.userProfile != null) {
                this.menuConfig.items = this.sdkLayoutMenuHeaderUtilsService.checkMenu(this.menuConfig.items, this.userProfile);
                if (this.bottomMenuConfig != null) {
                    this.bottomMenuConfig.items = this.sdkLayoutMenuHeaderUtilsService.checkMenu(this.bottomMenuConfig.items, this.userProfile);
                }
            }

            let responsiveMenuConfig: SdkResponsiveMenuSidebarConfig = {
                menu: this.menuConfig,
                bottomMenu: this.bottomMenuConfig
            }

            this.sidebarConfig.componentConfig = responsiveMenuConfig;
            this.sidebarConfigObs.next(this.sidebarConfig)
        }
    }

    // #endregion

    // #region Getters

    private get store(): SdkStoreService { return this.injectable(SdkStoreService) }

    private get dropdownConfig(): SdkDropdownButtonInput { return this._dropdownConfig }

    private get provider(): SdkProviderService { return this.injectable(SdkProviderService) }

    private get testataProfile(): SdkTestataProfileMessageService { return this.injectable(SdkTestataProfileMessageService) }

    private get sdkLayoutMenuHeaderUtilsService(): SdkLayoutMenuHeaderUtilsService { return this.injectable(SdkLayoutMenuHeaderUtilsService) }

    private get sdkRouterService(): SdkRouterService { return this.injectable(SdkRouterService) }

    // #endregion

    // #region Setters

    private setDropdownConfig = (value: SdkDropdownButtonInput) => {
        this._dropdownConfig = cloneDeep(value);

        let config = cloneDeep(this._dropdownConfig);

        if (this.userProfile != null && this.userProfile.configurations != null) {
            config.dropdownData = this.sdkLayoutMenuHeaderUtilsService.checkDropdownData(config.dropdownData, this.userProfile);
        }

        config.dropdownData = filter(config.dropdownData, (one: SdkDropdownButtonData) => {
            return !isEmpty(one.visible) ? this.provider.run(one.visible, {
                stazioneAppaltanteInfo: this.stazioneAppaltanteInfo,
                stazioniAppaltantiCount: this.stazioniAppaltantiCount,
                userProfile: this.userProfile
            }) === true : true;
        });

        this.profileSub.next(config);
    }

    // #endregion
}
