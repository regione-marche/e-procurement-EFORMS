import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Inject,
    Injector,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import {
    IDictionary,
    SDK_APP_CONFIG,
    SdkAbstractWidget,
    SdkAppEnvConfig,
    SdkDebounce,
    SdkRouterService,
    SdkScrollToService,
    SdkStoreService,
    UserProfile,
} from '@maggioli/sdk-commons';
import { cloneDeep, each, get, isEmpty, isObject, join } from 'lodash-es';

interface FooterLink {
    code: string;
    label?: string;
    url?: string;
    environment?: boolean;
    value?: string;
    internal?: boolean;
    src?: string;
}

interface FooterContacts {
    code: string;
    label?: string;
    value?: string;
    classList?: Array<string>;
    url?: string;
    internal?: boolean;
}

@Component({
    templateUrl: `sdk-layout-footer.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutFooterWidget extends SdkAbstractWidget<any> implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-layout-footer`;

    public footerSitenameTitle: string;
    public footerLogoHidden: boolean;
    public footerBottomLabel: string;
    public footerSitenameSubtitle: string;
    public footerSitenameDescription: string;
    public footerVerticalLinksTitle: string;
    public footerContactsTitle: string;
    public footerAssistanceTitle: string;
    public links: Array<FooterLink>;
    public bottomLinks: Array<FooterLink>;
    public images: Array<FooterLink>;
    public footerContacts: Array<FooterContacts>;
    public footerVerticalLinks: Array<FooterLink>;
    public footerAssistance: Array<FooterContacts>;
    public profile: string = '';
    public profileDivVisible: boolean = false;
    public currentEnte: string = '';
    public logo: string;

    private config: IDictionary<any>;

    @ViewChild('scrollToTop') public _scrollToTop: ElementRef;
    @ViewChild('scrollToBottom') public _scrollToBottom: ElementRef;

    constructor(inj: Injector, cdr: ChangeDetectorRef, @Inject(SDK_APP_CONFIG) private appConfig: SdkAppEnvConfig) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { }

    protected onAfterViewInit(): void {
        this.addSubscription(
            this.store.select('userProfile').subscribe(this.onData)
        );

        this.addSubscription(
            this.store.select('saInfo').subscribe(this.onSaInfoData)
        );
    }

    protected onDestroy(): void { }

    protected onConfig(config: IDictionary<any>): void {
        if (isObject(config)) {
            this.config = cloneDeep(config);
            this.footerBottomLabel = get(this.config, 'footerBottomLabel');
            this.footerLogoHidden = get(this.config, 'footerLogoHidden');
            this.footerSitenameTitle = get(this.config, 'footerSitenameTitle');
            this.footerSitenameSubtitle = get(this.config, 'footerSitenameSubtitle');
            this.footerSitenameDescription = get(this.config, 'footerSitenameDescription');
            this.links = this.getLinks(get(this.config, 'links'));
            this.bottomLinks = this.getLinks(get(this.config, 'bottomLinks'));
            this.images = get(this.config, 'images');
            this.footerContacts = get(this.config, 'footerContacts');
            this.footerAssistance = get(this.config, 'footerAssistance');
            this.footerVerticalLinksTitle = get(this.config, 'footerVerticalLinksTitle');
            this.footerVerticalLinks = this.getLinks(get(this.config, 'footerVerticalLinks'));
            this.footerContactsTitle = get(this.config, 'footerContactsTitle');
            this.footerAssistanceTitle = get(this.config, 'footerAssistanceTitle');
            this.logo = get(this.config, 'logoFooter');
        }
    }

    protected onUpdateState(state: boolean): void { }

    // #endregion

    // #region Public

    public trackByCode(index: number, item: FooterContacts | FooterLink): string | number {
        return isObject(item) ? item.code : index;
    }

    public getContactsItemClassList(item: FooterContacts): Array<string> {
        let classes: Array<string> = new Array();
        classes.push('footer-contacts-label');
        if (isObject(item) && !isEmpty(item.classList)) {
            classes = [...classes, ...item.classList];
        }
        return classes;
    }

    public executeScrollToTop(): void {
        this.runOutside(() => {
            this.sdkScrollToService.scrollTo(document.body, 0, 400); // For Safari
            this.sdkScrollToService.scrollTo(document.documentElement, 0, 400); // other
        });
    }

    public executeScrollToBottom(): void {
        this.runOutside(() => {
            this.sdkScrollToService.scrollTo(document.body, document.body.scrollHeight, 400); // For Safari
            this.sdkScrollToService.scrollTo(document.documentElement, document.body.scrollHeight, 400); // other
        });
    }

    @SdkDebounce()
    @HostListener('window:scroll', [])
    public onScroll(): void { this.runOutside(() => this.collapse(window.pageYOffset, 0)) }

    public getClasses(): string {
        let classes: Array<string> = ['sdk-footer', 'navbar-fixed-bottom'];

        if (this.getUpdateState() === true) {
            classes.push('disabled');
        }

        return join(classes, ' ');
    }

    // #endregion

    // #region Private

    private get scrollToTop(): HTMLElement {
        return this._scrollToTop.nativeElement;
    }

    private get scrollToBottom(): HTMLElement {
        return this._scrollToBottom.nativeElement;
    }

    private collapse(pageYOffset: number, initialHeaderBottomOffset: number): void {
        if (pageYOffset > initialHeaderBottomOffset) {
            this.scrollToTop.classList.add('go-to-show');
        } else {
            this.scrollToTop.classList.remove('go-to-show');
        }

        if ((window.innerHeight + window.scrollY) >= (document.body.offsetHeight - 2)) {
            this.scrollToBottom.classList.remove('go-to-show');
        } else {
            this.scrollToBottom.classList.add('go-to-show');
        }
    }

    private onData = (userProfile: UserProfile) => {
        setTimeout(() => this.markForCheck(() => {
            if (isObject(userProfile) && isObject(userProfile.configurations)) {
                let configurations: any = userProfile.configurations;
                this.profile = get(configurations, 'nome');
                this.profileDivVisible = true;
            }
        }));
    }

    private onSaInfoData = (saInfo: any) => {
        setTimeout(() => this.markForCheck(() => {
            if (isObject(saInfo)) {
                this.currentEnte = get(saInfo, 'nome');
            }
        }));
    }

    private getLinks(links: Array<FooterLink>) {
        each(links, (link: FooterLink) => {
            if (link.environment === true) {
                link.url = get(this.appConfig.environment, link.url);
            }
        });
        return links;
    }

    public goTo(item: FooterLink) {
        if (item.internal != undefined && item.internal === true) {
            this.routerService.navigateToPage(item.url);
        }
    }

    // #endregion

    // #region getters

    private get sdkScrollToService(): SdkScrollToService { return this.injectable(SdkScrollToService) };

    private get store(): SdkStoreService { return this.injectable(SdkStoreService) }

    private get routerService(): SdkRouterService { return this.injectable(SdkRouterService) }

    // #endregion
}
