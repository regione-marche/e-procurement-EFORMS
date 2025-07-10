import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import { SdkAbstractWidget, SdkProviderService } from '@maggioli/sdk-commons';
import {
    SdkRadioConfig,
    SdkRadioItem,
    SdkRadioOutput,
    SdkSimpleSearchConfig,
    SdkSimpleSearchInput,
    SdkSimpleSearchOutput,
} from '@maggioli/sdk-controls';
import { find, head, isEmpty, isObject, isUndefined, join } from 'lodash-es';
import { Observable, of } from 'rxjs';

@Component({
    templateUrl: `sdk-layout-header-mid.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutHeaderMidWidget extends SdkAbstractWidget<any> implements OnInit, OnDestroy {

    public searchFieldObs: Observable<SdkSimpleSearchConfig>;

    public searchData = of({ data: '' } as SdkSimpleSearchInput);

    public followusTitle: string;

    public showSearchForm: boolean;

    private providerName: string;

    public logo: string;
    public titolo: string;
    public sottotitolo: string;

    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { }

    protected onAfterViewInit(): void { }

    protected onDestroy(): void { }

    protected onConfig(config: any): void {
        this.markForCheck(() => {
            this.followusTitle = config.followusTitle;
            this.providerName = config.provider;
            // Al momento il provider gestisce solo il tasto cerca. Se non è valorizzato si nasconde la form di ricerca
            this.showSearchForm = !isEmpty(this.providerName);
            this.logo = config.logo;
            this.titolo = config.titolo;
            this.sottotitolo = config.sottotitolo;
            this.searchFieldObs = of(config.searchField);

            this.isReady = true;
        });
    }

    protected onUpdateState(state: boolean): void {
        setTimeout(() => this.markForCheck());
    }

    // #endregion

    // #region Public

    public onOutput(item: SdkSimpleSearchOutput): void {
        if (isObject(item) && isEmpty(this.providerName) === false) {
            this.provider.run(this.providerName, {
                item
            }).subscribe(this.manageProvider);
        }
    }

    public getClasses(): string {
        let classes: Array<string> = ['sdk-layout-header', 'sdk-layout-header-mid'];

        if (this.getUpdateState() === true) {
            classes.push('disabled');
        }

        return join(classes, ' ');
    }

    // #endregion

    // #region Getters

    private get provider(): SdkProviderService { return this.injectable(SdkProviderService) }

    // #endregion

    // #region Private

    public manageProvider(): void {
    }

    // #endregion
}
