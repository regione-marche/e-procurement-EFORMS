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
import { ActivatedRoute } from '@angular/router';
import {
    SdkAbstractView,
    SdkAppConfig,
    SdkContentConfig,
    SdkLayoutConfig,
    SdkRenderMap,
    SdkRenderMessageService,
} from '@maggioli/sdk-commons';

@Component({
    selector: `sdk-app`,
    template: `<sdk-layout-render></sdk-layout-render>`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkAppWidget extends SdkAbstractView implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-app`;

    public config: { page: SdkContentConfig, layout: SdkLayoutConfig, app: SdkAppConfig }

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { this.init() }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    /**
     * @ignore
     */
    protected onUpdateState(state: boolean): void { }

    // #endregion

    // #region Public

    // #endregion

    // #region Private

    private init(): void { this.addSubscription(this.route.data.subscribe(this.onResolve)) }

    private onResolve = (data: { config: SdkRenderMap }) => this.message.emit(data.config)

    // #endregion

    // #region Getters

    private get message(): SdkRenderMessageService { return this.injectable(SdkRenderMessageService) }

    private get route(): ActivatedRoute { return this.injectable(ActivatedRoute) }

    // #endregion

}

