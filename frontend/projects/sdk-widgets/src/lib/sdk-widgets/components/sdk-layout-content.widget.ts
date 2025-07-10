import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SdkAbstractWidget } from '@maggioli/sdk-commons';

@Component({
    // to avoid NG0912: Component ID generation collision detected with sdk-layout-section (do not use this selector!)
    selector: 'sdk-layout-content-local',
    templateUrl: `sdk-layout-content.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutContentWidget extends SdkAbstractWidget<void> implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-layout-content`;

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    protected onConfig(config: void): void { }

    protected onUpdateState(state: boolean): void { }

    // #endregion

}
