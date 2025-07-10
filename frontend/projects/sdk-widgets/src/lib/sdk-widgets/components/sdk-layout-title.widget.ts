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
import { IDictionary, SdkAbstractWidget } from '@maggioli/sdk-commons';


@Component({
    templateUrl: `sdk-layout-title.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutTitleWidget extends SdkAbstractWidget<any> implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-layout-title`;

    public config: IDictionary<any>;

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { this.init() }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    protected onConfig(config: IDictionary<any>): void {
        this.markForCheck(() => {
            this.config = config;

            this.isReady = true;
        });
    }

    protected onUpdateState(state: boolean): void { }

    // #endregion

    // #region Private

    private init(): void { }

    // #endregion

    // #region Getters

    // #endregion

    // #region Public

    // #endregion

}
