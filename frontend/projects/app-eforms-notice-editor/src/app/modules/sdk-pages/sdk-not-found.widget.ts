import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Injector, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { SdkAbstractView } from '@maggioli/sdk-commons';

@Component({
    selector: `sdk-not-found`,
    template: ``,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkNotFoundWidget extends SdkAbstractView implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `sdk-not-found`;

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { }

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

    // #endregion

    // #region Getters

    // #endregion

}
