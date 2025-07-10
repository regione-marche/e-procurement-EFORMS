import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Injector,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    IDictionary,
    SdkAbstractWidget,
    SdkBreadcrumbsMessageService,
    SdkProviderService,
    SdkRouterService,
    SdkStateMap,
    SdkStoreService,
    UserProfile,
} from '@maggioli/sdk-commons';
import { SdkBreadcrumbConfig, SdkBreadcrumbItem, SdkBreadcrumbOutput } from '@maggioli/sdk-controls';
import { each, filter, get, isArray, isEmpty, isObject, isString, join, merge, size } from 'lodash-es';
import { Subject } from 'rxjs';

import { SdkLayoutBreadcrumbsCollapseService } from './sdk-layout-breadcrumbs-collapse.service';


@Component({
    templateUrl: `sdk-layout-breadcrumbs.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutBreadcrumbsWidget extends SdkAbstractWidget<any> implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-layout-breadcrumbs`;

    public configSub: Subject<SdkBreadcrumbConfig> = new Subject();
    public config: IDictionary<any>;
    // true se si vuole nascondere il pulsante di menu tabs e triggerare il collapse, false altrimenti
    public menuTabsState: boolean = false;

    private breadcrumbsValues: Array<SdkBreadcrumbItem> = new Array();
    private state: SdkStateMap;
    private userProfile: UserProfile;

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void {
        this.addSubscription(this.store.select('').subscribe((data: SdkStateMap) => {
            this.state = data;
        }));

        this.addSubscription(this.getRefreshBreadcrumbsSubject(() => {
            if (this.breadcrumbsValues != null) {
                this.logger.debug('Breadcrumb refreshed');
                this.updateBreadcrumbsConfig();
            }
        }));

        this.addSubscription(
            this.store.select('userProfile').subscribe((userProfile: UserProfile) => {
                this.userProfile = userProfile;
            })
        );

        this.addSubscription(
            this.disableMenuTabsService$.subscribe((menuTabsState: boolean) => {
                if (this.menuTabsState != menuTabsState) {
                    this.markForCheck(() => {
                        this.menuTabsState = menuTabsState;
                        this.menuTabsState ? this.breadcrumbsCollapseService.collapse() : this.breadcrumbsCollapseService.expand();
                    });
                }
            })
        );
    }

    protected onAfterViewInit(): void { this.init() }

    protected onDestroy(): void { }

    protected onConfig(config: IDictionary<any>): void {
        if (config != null) {
            this.config = config;
        }
    }

    protected onUpdateState(state: boolean): void {
        this.updateBreadcrumbsConfig();
    }

    // #endregion

    // #region Private

    private init(): void {
        this.addSubscription(this.breadcrumbs.on(this.onData));
    }

    private onData = (values: Array<SdkBreadcrumbItem>) => {
        this.breadcrumbsValues = values;
        this.updateBreadcrumbsConfig();
    }

    private updateBreadcrumbsConfig(): void {
        this.configSub.next({ items: [] });
        // check visibility
        this.breadcrumbsValues = filter(this.breadcrumbsValues, (one: SdkBreadcrumbItem) => {
            return (one.visible == null || this.provider.run(one.visible, { state: this.state })) as boolean;
        });
        // check labelProvider
        each(this.breadcrumbsValues, (one: SdkBreadcrumbItem) => {
            if (one.code === 'home-page') {
                one.label = get(this.userProfile.configurations, 'nome');
            }

            if (one.labelProvider != null) {
                const providerValue: string = this.provider.run(one.labelProvider);
                if (providerValue != null) {
                    if (one.labelParams == null) {
                        one.labelParams = {};
                    }
                    one.labelParams = merge(one.labelParams, {
                        value: providerValue
                    });
                }
            }
        });
        let breadcrumbsConfig: SdkBreadcrumbConfig = {
            items: isArray(this.breadcrumbsValues) && size(this.breadcrumbsValues) > 0 ? [...this.breadcrumbsValues] : []
        };
        if (this.getUpdateState() === true) {
            breadcrumbsConfig.disabled = true
        }
        this.configSub.next(breadcrumbsConfig);
    }

    // #endregion

    // #region Getters

    private get breadcrumbs(): SdkBreadcrumbsMessageService { return this.injectable(SdkBreadcrumbsMessageService) }

    private get routerService(): SdkRouterService { return this.injectable(SdkRouterService) }

    private get provider(): SdkProviderService { return this.injectable(SdkProviderService) }

    private get store(): SdkStoreService { return this.injectable(SdkStoreService) }

    public get breadcrumbsCollapseService(): SdkLayoutBreadcrumbsCollapseService { return this.injectable(SdkLayoutBreadcrumbsCollapseService) }

    // #endregion

    // #region Public

    public onBreadcrumbClick(out: SdkBreadcrumbOutput): void {
        if (isObject(out) && isObject(out.item)) {
            let item: SdkBreadcrumbItem = out.item;
            this.logger.info('onBreadcrumbClick >>>', item);
            if (!isEmpty(item.slug)) {
                if (isString(item.additionalParams)) {
                    let prov: string = item.additionalParams as unknown as string;
                    let params: IDictionary<any> = this.provider.run(prov);
                    this.routerService.navigateToPage(item.slug, params);
                } else if (isObject(item.additionalParams)) {
                    each(item.additionalParams, (value: any, key: string) => {
                        let param: any = this.provider.run(value);
                        value = param;
                        item.additionalParams[key] = value;
                    });
                    this.routerService.navigateToPage(item.slug, item.additionalParams);
                } else {
                    this.routerService.navigateToPage(item.slug);
                }
            }
        }
    }

    public getClasses(): string {
        let classes: Array<string> = ['sdk-layout-header', 'sdk-layout-breadcrumbs-container'];

        return join(classes, ' ');
    }

    // #endregion

}
