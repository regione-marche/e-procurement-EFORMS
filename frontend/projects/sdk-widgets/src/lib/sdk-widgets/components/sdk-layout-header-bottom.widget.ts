import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { SdkAbstractWidget } from '@maggioli/sdk-commons';
import { join } from 'lodash-es';

@Component({
    templateUrl: `sdk-layout-header-bottom.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutHeaderBottomWidget extends SdkAbstractWidget<any> implements OnInit, AfterViewInit, OnDestroy {

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    protected onConfig(_config: any): void { }

    protected onUpdateState(state: boolean): void {
        setTimeout(() => this.markForCheck());
    }

    // #endregion

    // #region Private

    // #endregion

    // #region Public

    public getClasses(): string {
        let classes: Array<string> = ['sdk-layout-header', 'sdk-layout-header-bottom'];

        if (this.getUpdateState() === true) {
            classes.push('disabled');
        }

        return join(classes, ' ');
    }

    // #endregion
}
