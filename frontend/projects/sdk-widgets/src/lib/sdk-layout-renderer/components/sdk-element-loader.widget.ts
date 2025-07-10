import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    HostBinding,
    Injector,
    Input,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { IDictionary, SdkAbstractView, SdkAbstractWidget, SdkLayoutSectionConfig } from '@maggioli/sdk-commons';
import { cloneDeep, get, isObject, merge, toString } from 'lodash-es';
import { of } from 'rxjs';

@Component({
    selector: `sdk-element-loader`,
    template: `
        <div *ngIf="isReady">
            <sdk-element-loader *ngFor="let key of section?.sons"
                [key]="key" [map]="map" [settings]="settings"></sdk-element-loader>
        </div>
    `,
    styles: [`sdk-element-loader { display: block }`],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkElementLoaderWidget extends SdkAbstractView implements OnInit, OnDestroy {

    @HostBinding('class') classNames = '';

    @Input() public map: IDictionary<SdkLayoutSectionConfig>;
    @Input() public settings: IDictionary<any>;
    @Input() public key: string;

    public section: SdkLayoutSectionConfig;

    constructor(inj: Injector, cdr: ChangeDetectorRef, private ref: ElementRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { this.loadSection() }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    // #endregion

    // #region Public

    public track(index: number, section: SdkLayoutSectionConfig): string { return isObject(section) ? section.id : toString(index) }

    // #endregion

    // #region Private

    private loadSection(): void {
        this.section = cloneDeep(get(this.map, this.key));

        if (isObject(this.section)) {

            let config = merge(this.settings, this.section.settings);

            this.classNames = this.section.classNames;

            let component = document.createElement(this.section.selector) as NgElement & WithProperties<SdkAbstractWidget<any>>;

            component.id = this.section.id;
            component.config$ = of(config);

            this.element.appendChild(component);

            this.markForCheck(() => this.isReady = true);

        }
    }

    /**
     * @ignore
     */
    protected onUpdateState(state: boolean): void { }


    private get element(): HTMLElement { return this.ref.nativeElement }

    // #endregion

}
