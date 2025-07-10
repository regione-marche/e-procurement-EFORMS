import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { isObject } from "lodash-es";
import { Observable, Subscription } from "rxjs";

@Component({
    templateUrl: './output-validation-internal-sidebar.component.html',
    styleUrl: './output-validation-internal-sidebar.component.scss',
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutputValidationInternalSidebarComponent implements OnInit, OnDestroy {

    @HostBinding('class') classNames = `output-validation-internal-sidebar`;
    
    // #region Variables

    private subscription: Subscription;
    public config: any;
    public checkSuccessActionDescr: string;
    public validationErrors: Array<string>;
    public validationErrorsNum: number;
    public checkValidationErrors: boolean;

    @Input('config') public config$: Observable<any>;   // Observable con la configurazione

    // #endregion

    constructor(private cdr: ChangeDetectorRef) { }

    // #region Hooks

    public ngOnInit(): void {
        this.subscription = this.config$.subscribe((config: any) => {
            this.config = config;
            this.checkSuccessActionDescr = this.config.checkSuccessActionDescr || '';
            this.validationErrors = this.config.validationErrors || [];

            this.validationErrorsNum = this.validationErrors.length;
            this.checkValidationErrors = this.validationErrors.length > 0 ? true : false;

            this.cdr.markForCheck();
        });
    }

    public ngOnDestroy(): void {
        if (isObject(this.subscription)) {
            this.subscription.unsubscribe();
        }
    }

    // #endregion

    // #region Private



    // #endregion
}