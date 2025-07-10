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
    SdkAbstractView,
    SdkLayoutSectionConfig,
    SdkRenderMap,
    SdkRenderMessageService,
} from '@maggioli/sdk-commons';
import { isObject } from 'lodash-es';
import { mergeMap, tap } from 'rxjs/operators';

import { SdkSectionLoader } from '../services/sdk-section-loader.service';
import { SdkStyleLoader } from '../services/sdk-style-loader.service';

@Component({
    selector: `sdk-layout-render`,
    template: `<sdk-section-render *ngIf="isReady" [roots]="roots" [map]="map" [settings]="settings"></sdk-section-render>`,
    styles: [`sdk-layout-render { display: block }`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutRenderWidget extends SdkAbstractView implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-layout-render`;

    private _map: IDictionary<SdkLayoutSectionConfig>;
    private _settings: IDictionary<any>;
    private _roots: Array<string>;
    private _urls: Array<string>;

    // public config: SdkRenderMap;

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hopoks

    protected onInit(): void { this.init() }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    // #endregion

    // #region Public

    // #endregion

    // #region Private

    private init(): void {
        this.addSubscription(
            this.message.on(this.onRender)
            // this.store.select('render').subscribe(this.onRender)
        );
    }

    private onRender = (config: SdkRenderMap) => {

        // this.detectChanges(() => this.isReady = false);

        if (isObject(config) && isObject(config.layout)) {
            setTimeout(() => {

                let { map, roots } = this.section.parse(config.layout);

                this.map = { ...map };
                this.roots = [...roots];
                this.settings = { ...config.layout.settings, ...config.app.settings };

                this.loadStyles(config.layout.styleUrls);

            });
        }

    };

    private loadStyles(urls: Array<string>) {
        let oldUrls: Array<string> = this.urls != null ? [...this.urls] : [];
        if (urls != null) {
            oldUrls = oldUrls.filter((el) => !urls.includes(el));
        }
        this.style.load(urls)
            .pipe(
                tap(() => {
                    // salvataggio nuovi url
                    this.urls = urls;
                }),
                mergeMap(() => this.style.unload(oldUrls))
            )
            .subscribe(this.onLoad)
    }

    private onLoad = () => this.markForCheck(() => this.isReady = true)

    /**
     * @ignore
     */
    protected onUpdateState(state: boolean): void { }

    // #endregion

    // #region Getters

    private get section(): SdkSectionLoader { return this.injectable(SdkSectionLoader) }

    private get style(): SdkStyleLoader { return this.injectable(SdkStyleLoader) }

    private get message(): SdkRenderMessageService { return this.injectable(SdkRenderMessageService) }

    public get map(): IDictionary<SdkLayoutSectionConfig> { return this._map }

    public set map(value: IDictionary<SdkLayoutSectionConfig>) { this.markForCheck(() => this._map = value) }

    public get settings(): IDictionary<any> { return this._settings }

    public set settings(value: IDictionary<any>) { this.markForCheck(() => this._settings = value) }

    public get roots(): Array<string> { return this._roots }

    public set roots(value: Array<string>) { this.markForCheck(() => this._roots = value) }

    public get urls(): Array<string> { return this._urls }

    public set urls(value: Array<string>) { this._urls = value }

    // #endregion

}
