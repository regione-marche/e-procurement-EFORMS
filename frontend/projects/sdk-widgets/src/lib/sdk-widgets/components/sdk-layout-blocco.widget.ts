import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { SdkAbstractView } from '@maggioli/sdk-commons';

@Component({
    selector: 'sdk-layout-blocco',
    templateUrl: `sdk-layout-blocco.widget.html`,
    styleUrls: ['sdk-layout-blocco.widget.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutBloccoWidget extends SdkAbstractView {

    public canBeFocused: boolean = true;

    constructor(inj: Injector, private cdr: ChangeDetectorRef) {
        super(inj, cdr);
    }

    protected onInit(): void { }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    protected onUpdateState(state: boolean): void {
        setTimeout(() => {
            this.canBeFocused = state == false;
            this.cdr.markForCheck();
        });
    }

    public focusContent(): void {
        let elem: HTMLElement = document.querySelector('.sdk-content-render .sdk-section-render');
        if (elem != null) {
            setTimeout(() => elem.focus());
        }
    }
}