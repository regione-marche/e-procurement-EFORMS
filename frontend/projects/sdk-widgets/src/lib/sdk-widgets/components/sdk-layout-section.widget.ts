import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SdkAbstractWidget } from '@maggioli/sdk-commons';

@Component({
    templateUrl: `sdk-layout-section.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutSectionWidget extends SdkAbstractWidget<void> implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-layout-section`;

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    protected onConfig(config: void): void { }

    protected onUpdateState(state: boolean): void { }

    // #endregion

}
