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
import { Title } from '@angular/platform-browser';
import {
    IDictionary,
    SdkAbstractView,
    SdkBreadcrumbsMessageService,
    SdkLayoutSectionConfig,
    SdkRenderMap,
    SdkRenderMessageService,
} from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { get, has, isObject } from 'lodash-es';
import { mergeMap, tap } from 'rxjs/operators';

import { SdkSectionLoader } from '../services/sdk-section-loader.service';
import { SdkStyleLoader } from '../services/sdk-style-loader.service';


@Component({
    selector: `sdk-content-render`,
    template: `<sdk-section-render [roots]="roots" [map]="map" [settings]="settings" tabindex="0" role="main"></sdk-section-render>`,
    styles: [`sdk-content-render { display: block }`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class SdkContentRenderWidget extends SdkAbstractView implements OnInit, OnDestroy {
    @HostBinding('class') classNames = `sdk-content-render`;

    public map: IDictionary<SdkLayoutSectionConfig>;
    public settings: IDictionary<any>;
    public roots: Array<string>;
    private _urls: Array<string>;

    constructor(inj: Injector, cdr: ChangeDetectorRef, private translate: TranslateService) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { this.init() }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    // #endregion

    // #region Public

    // #endregion

    // #region Private

    private init(): void {
        this.addSubscription(

            this.render.on(this.onConfig)

            // this.store.select('render').subscribe()
        )
    }

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

    private onConfig = (config: SdkRenderMap) => {

        if (isObject(config) && isObject(config.page)) {

            setTimeout(() => {

                let { map, roots } = this.section.parse(config.page);

                this.map = { ...map };
                this.roots = [...roots];
                this.settings = { ...config.page.settings, ...config.app.settings };

                this.breadcrumbs.emit(this.settings.breadcrumbs);

                if (!has(this.settings, 'loadRemoteTitle') || has(this.settings, 'loadRemoteTitle') === true && get(this.settings, 'loadRemoteTitle') == false) {
                    this.title.setTitle(this.translate.instant(config.page.title));
                }

                this.loadStyles(config.page.styleUrls);
            })
        }

    };

    private onLoad = () => this.markForCheck(() => this.isReady = true)

    /**
     * @ignore
     */
    protected onUpdateState(state: boolean): void { }

    // #endregion

    // #region Getters

    private get section(): SdkSectionLoader { return this.injectable(SdkSectionLoader) }

    private get render(): SdkRenderMessageService { return this.injectable(SdkRenderMessageService) }

    private get breadcrumbs(): SdkBreadcrumbsMessageService { return this.injectable(SdkBreadcrumbsMessageService) }

    private get style(): SdkStyleLoader { return this.injectable(SdkStyleLoader) }

    private get title(): Title { return this.injectable(Title) }

    public get urls(): Array<string> { return this._urls }

    public set urls(value: Array<string>) { this._urls = value }

    // #endregion

}
