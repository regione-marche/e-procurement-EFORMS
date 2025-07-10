import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    HostBinding,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { IDictionary, SdkAbstractView, SdkLayoutSectionConfig } from '@maggioli/sdk-commons';
import { toString } from 'lodash-es';

@Component({
    selector: `sdk-section-render`,
    template: `
        <div *ngIf="isReady">
            <sdk-element-loader *ngFor="let key of roots" [key]="key" [map]="map"
                [settings]="settings"></sdk-element-loader>
        </div>`,
    styles: [`sdk-section-render { display: block }`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkSectionRenderWidget extends SdkAbstractView implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-section-render`;

    private _map: IDictionary<SdkLayoutSectionConfig>;
    private _settings: IDictionary<any>;
    private _roots: Array<string>;

    @Input() public set map(value: IDictionary<SdkLayoutSectionConfig>) { this.markForCheck(() => this._map = value) }
    @Input() public set settings(value: IDictionary<any>) { this.markForCheck(() => this._settings = value) }
    @Input() public set roots(value: Array<string>) { this.markForCheck(() => this._roots = value) }

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { this.markForCheck(() => this.isReady = true) }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    // #endregion

    // #region Public

    public track(index: number, root: string): string { return root || toString(index) }

    // #endregion

    // #region Private

    /**
     * @ignore
     */
    protected onUpdateState(state: boolean): void { }

    // #endregion

    // #region Getters

    public get map(): IDictionary<SdkLayoutSectionConfig> { return this._map }
    public get settings(): IDictionary<any> { return this._settings }
    public get roots(): Array<string> { return this._roots }

    // #endregion

}
