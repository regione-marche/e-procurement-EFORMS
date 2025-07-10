import { AfterViewInit, ChangeDetectorRef, Directive, Injector } from '@angular/core';

import { SdkAbstractWidget } from './sdk-widget.abstract';

@Directive()
export abstract class SdkBusinessAbstractWidget<X> extends SdkAbstractWidget<X> implements AfterViewInit {

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Abstract

    // #endregion

    // #region Hooks

    override ngAfterViewInit(): void {
        this.scrollToTop();
        super.ngAfterViewInit();
    }

    // #endregion

    // #region Protected

    // #endregion

    // #region Getters

    // #endregion

    // #region Private

    private scrollToTop(): void {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto'
        });
    }


    // #endregion

}
