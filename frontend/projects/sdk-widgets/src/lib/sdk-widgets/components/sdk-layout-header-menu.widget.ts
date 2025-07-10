import { animate, state, style, transition, trigger } from '@angular/animations';
import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostListener,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {
    IDictionary,
    SdkAbstractWidget,
    SdkDebounce,
    SdkProviderService,
    SdkRouterService,
    SdkStoreService,
    SdkTestataProfileMessageService,
    UserProfile
} from '@maggioli/sdk-commons';
import {
    SdkBasicButtonInput,
    SdkBasicButtonOutput,
    SdkDropdownButtonData,
    SdkDropdownButtonInput,
    SdkDropdownButtonOutput,
    SdkMenuConfig,
    SdkMenuItem,
    SdkMenuOutput,
    SdkModalConfig
} from '@maggioli/sdk-controls';
import { cloneDeep, filter, get, isEmpty, isObject, join } from 'lodash-es';
import { BehaviorSubject, PartialObserver, Subject } from 'rxjs';

import { SdkLayoutMenuHeaderUtilsService } from './sdk-layout-header-menu-utils.service';

@Component({
    templateUrl: `sdk-layout-header-menu.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: [
        trigger('menuContent', [
            state('hidden', style({
                width: '0'
            })),
            state('visible', style({
                width: '*'
            })),
            transition('visible <=> hidden', animate('{{transitionParams}}'))
        ])
    ]
})
export class SdkLayoutHeaderMenuWidget extends SdkAbstractWidget<any> implements OnInit, AfterViewInit, OnDestroy {

    public menuVisible: boolean = false;
    public menuObs: BehaviorSubject<SdkMenuConfig> = new BehaviorSubject(null);
    public bottomMenuObs: BehaviorSubject<SdkMenuConfig> = new BehaviorSubject(null);
    public subMenuObs: BehaviorSubject<SdkMenuConfig> = new BehaviorSubject(null);
    public modalConfigObs: Subject<SdkModalConfig<any, void, any>> = new Subject();
    public profileSub: BehaviorSubject<SdkDropdownButtonInput> = new BehaviorSubject(null);
    public profileResponsiveSub: BehaviorSubject<SdkDropdownButtonInput> = new BehaviorSubject(null);
    public messageButtonSub: Subject<SdkBasicButtonInput> = new Subject();
    public dropdownConfigVisible: boolean = false;
    public headerLogoSmall: string;
    public transitionOptions: string = '200ms cubic-bezier(0.86, 0, 0.07, 1)';
    public animating: boolean;
    public selected: boolean = false;
    public showMenu: boolean = false;
    public canBeFocused: boolean = true;

    private config: IDictionary<any>;
    private menuConfig: SdkMenuConfig;
    private bottomMenuConfig: SdkMenuConfig;
    private _dropdownConfig: SdkDropdownButtonInput;
    private modalConfig: SdkModalConfig<any, void, any>;
    private userProfile: UserProfile;
    private initialoffsetTop: number;
    private openWith: string;


    @ViewChild('headerMenu') _headerMenu: ElementRef;

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { this.init(); }

    protected onAfterViewInit(): void {
        this.addSubscription(this.testataProfile.on(this.onTestataProfile));
        this.loadMenu();
    }

    protected onDestroy(): void { }

    protected onConfig(config: any): void {
        if (isObject(config)) {
            this.config = cloneDeep(config);
            this.menuVisible = get(this.config, 'menuVisible');
            this.headerLogoSmall = get(this.config, 'headerLogoSmall');
            this.menuConfig = get(this.config, 'menu');
            this.bottomMenuConfig = get(this.config, 'bottomMenu');

            this.modalConfig = {
                code: 'modal',
                title: '',
                openSubject: new Subject()
            };

            setTimeout(() => {
                this.modalConfigObs.next(this.modalConfig);
            });

            if (isObject(get(this.config, 'profileDropdownButton'))) {
                this.setDropdownConfig(get(this.config, 'profileDropdownButton'));
            }
        }
    }

    protected onUpdateState(state: boolean): void {

        this.markForCheck(() => this.canBeFocused = state == false);

        setTimeout(() => {

            this.menuConfig.disabled = state;
            if (this.menuObs == null) {
                this.menuObs = new BehaviorSubject(this.menuConfig);
            } else {
                this.menuObs.next(this.menuConfig);
            }

            if (this.bottomMenuObs == null && this.bottomMenuConfig != null) {
                this.bottomMenuObs = new BehaviorSubject(this.bottomMenuConfig);
            } else {
                this.bottomMenuObs.next(this.bottomMenuConfig);
            }

            if (isObject(this.dropdownConfig)) {
                let config = cloneDeep(this.dropdownConfig);
                config = {
                    ...config,
                    disabled: state
                };
                this.setDropdownConfig(config);
            }
        });
    }

    // #endregion

    // #region Getters

    private get routerService(): SdkRouterService { return this.injectable(SdkRouterService) }

    private get store(): SdkStoreService { return this.injectable(SdkStoreService) }

    private get dropdownConfig(): SdkDropdownButtonInput { return this._dropdownConfig }

    private get provider(): SdkProviderService { return this.injectable(SdkProviderService) }

    private get testataProfile(): SdkTestataProfileMessageService { return this.injectable(SdkTestataProfileMessageService) }

    private get sdkLayoutMenuHeaderUtilsService(): SdkLayoutMenuHeaderUtilsService { return this.injectable(SdkLayoutMenuHeaderUtilsService) }

    // #endregion

    // #region Private

    private get headerMenu(): HTMLElement {
        return this._headerMenu.nativeElement;
    }

    private collapse(pageYOffset: number, initialHeaderMenuOffset: number): void {
        if ((pageYOffset >= initialHeaderMenuOffset)) {
            if (this.headerMenu.classList.contains('sdk-header-sticky') === false) {
                this.headerMenu.classList.add('sdk-header-sticky');
            }
        } else {
            if (this.headerMenu.classList.contains('sdk-header-sticky') === true) {
                this.headerMenu.classList.remove('sdk-header-sticky');
            }
        }
    }

    private init(): void {
        this.addSubscription(
            this.store.select('userProfile').subscribe(this.onData)
        );
        this.markForCheck(() => {
            this.isReady = true;
        });
    }

    private onData = (userProfile: UserProfile) => {
        this.userProfile = userProfile;
        setTimeout(() => this.markForCheck(() => {
            if (isObject(this.dropdownConfig)) {
                let config = cloneDeep(this.dropdownConfig);
                config = {
                    ...config,
                    labelParams: {
                        value: userProfile ? `${userProfile.nome} ${userProfile.cognome} (${userProfile.codiceFiscale})` : ''
                    }
                };
                this.setDropdownConfig(config);
                this.dropdownConfigVisible = true;
            }
        }));
    }

    private onTestataProfile = (data: boolean) => {
        setTimeout(() => this.markForCheck(() => {
            this.dropdownConfigVisible = data;
        }));
    }

    private onProfileResponse: PartialObserver<IDictionary<any>> = {
        next: (res: IDictionary<any>) => { this.logger.info('onProfileResponse', res) },
        error: (err: Error) => { this.logger.error('onProfileResponse', err) },
    }


    private loadMenu(): void {
        if (this.userProfile != null) {
            this.menuConfig.items = this.sdkLayoutMenuHeaderUtilsService.checkMenu(this.menuConfig.items, this.userProfile);
            this.menuObs.next(this.menuConfig);
            if (this.bottomMenuConfig != null) {
                this.bottomMenuConfig.items = this.sdkLayoutMenuHeaderUtilsService.checkMenu(this.bottomMenuConfig.items, this.userProfile);
                this.bottomMenuObs.next(this.bottomMenuConfig);
            }
        } else {
            this.menuObs.next(this.menuConfig);
            if (this.bottomMenuConfig != null) {
                this.bottomMenuObs.next(this.bottomMenuConfig);
            }
        }
        setTimeout(() => this.initialoffsetTop = this.headerMenu.offsetTop);
    }

    // #endregion

    // #region Public

    @SdkDebounce()
    @HostListener('window:scroll', ['$event'])
    public onScroll(): void {
        this.runOutside(() => this.collapse(window.pageYOffset, this.initialoffsetTop));
    }

    public manageMenuClick(menuOutput: SdkMenuOutput, child: boolean = false): void {
        if (isObject(menuOutput) && isObject(menuOutput.item)) {
            let item: SdkMenuItem = menuOutput.item;

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
                    if (child) {
                        // chiudo menu
                        this.showMenu = false;
                        this.selected = false;
                        delete this.openWith;
                    }

                    if (isObject(item.additionalParams)) {
                        this.routerService.navigateToPage(item.slug, item.additionalParams);
                    } else {
                        this.routerService.navigateToPage(item.slug);
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

    public messageClick(_button: SdkBasicButtonOutput): void {
        this.modalConfig.openSubject.next(true);
    }

    public getClasses(): string {
        let classes: Array<string> = ['sdk-layout-header', 'sdk-layout-header-menu'];

        if (this.getUpdateState() === true) {
            classes.push('disabled');
        }

        return join(classes, ' ');
    }

    public toggle(event: any, item: SdkMenuItem, bottom: boolean = false): boolean {
        console.log('toggle >>>', item);
        if (this.config.disabled || this.animating || this.getUpdateState() === true) {
            return false;
        }

        this.animating = true;

        if (this.openWith != null && this.selected && this.openWith == item.code) {
            // chiudo menu
            this.showMenu = false;
            this.selected = false;
            delete this.openWith;
        } else {
            if (item.items) {
                this.openWith = item.code;
                this.selected = true;
                this.showMenu = true;
                if (bottom) {
                    this.subMenuObs.next({
                        ...this.bottomMenuConfig,
                        items: item.items,
                        vertical: true
                    });
                } else {
                    this.subMenuObs.next({
                        ...this.menuConfig,
                        items: item.items,
                        vertical: true
                    });
                }
            } else {
                this.manageMenuClick({
                    item
                });
                this.showMenu = false;
                this.selected = false;
                delete this.openWith;
            }
            this.animating = false;
        }

        event.preventDefault();
    }

    public onToggleDone(_event: any): void {
        this.animating = false;
    }

    // #endregion

    // #region Setters

    private setDropdownConfig = (value: SdkDropdownButtonInput) => {
        this._dropdownConfig = cloneDeep(value);

        let config = cloneDeep(this._dropdownConfig);

        config.dropdownData = filter(config.dropdownData, (one: SdkDropdownButtonData) => {
            return !isEmpty(one.visible) ? this.provider.run(one.visible, {
                userProfile: this.userProfile
            }) === true : true;
        });

        this.profileSub.next(config);
        let config2 = cloneDeep(config);
        config2 = {
            ...config2,
            icon: 'mgg-icons-user',
            iconPos: 'left',
            label: ' '
        }
        this.profileResponsiveSub.next(config2);
    }

    // #endregion
}
