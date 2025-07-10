import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { WidgetInstance } from 'friendly-challenge';
import { SDK_APP_CONFIG, SdkAppEnvConfig } from '../sdk-app-config/sdk-app.config';
import { SdkLocaleService } from '../sdk-locale/sdk-locale.service';
import { IDictionary } from '../sdk-shared/types/sdk-common.types';
import { Subject, Subscription } from 'rxjs';
/**
 * Componente che renderizza il Friendly Captcha
 */
@Component({
    selector: 'sdk-friendly-captcha',
    template: '<div class="frc-captcha" #captcha></div>',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkFriendlyCaptchaComponent implements OnInit, AfterViewInit, OnDestroy {

    @ViewChild('captcha') public _captchaRef: ElementRef;

    @Input('reset') public resetSubject$: Subject<boolean>;
    @Output('solution') solutionEvent: EventEmitter<string> = new EventEmitter();

    private resetSubjectSubscription: Subscription;
    private widgetInstance: WidgetInstance;

    constructor(@Inject(SDK_APP_CONFIG) private appConfig: SdkAppEnvConfig, private sdkLocaleService: SdkLocaleService) { }

    public ngOnInit(): void {
        if (this.resetSubject$ != null) {
            this.resetSubjectSubscription = this.resetSubject$.subscribe((reset: boolean) => {
                if (this.widgetInstance != null) {
                    this.widgetInstance.reset();
                    this.solutionEvent.emit(null);
                }
            });
        }
    }

    public ngAfterViewInit(): void {

        // Options... vedi https://docs.friendlycaptcha.com/#/widget_api?id=javascript-api
        const options: IDictionary<any> = {
            doneCallback: this.doneCallback,
            sitekey: this.appConfig.environment.FRIENDLY_CAPTCHA_SITE_KEY ?? '',
            language: this.sdkLocaleService.locale ?? 'it',
            puzzleEndpoint: 'https://apis.maggioli.cloud/rest/captcha/v2/puzzle',
            startMode: 'none'

        };
        // Creo l'istanza
        this.widgetInstance = new WidgetInstance(this.captcha, options);
    }

    public ngOnDestroy(): void {
        if (this.resetSubjectSubscription != null) {
            this.resetSubjectSubscription.unsubscribe();
        }
    }

    private get captcha(): HTMLElement {
        return this._captchaRef.nativeElement;
    }

    private doneCallback = (solution: string) => {
        // Callback di risoluzione
        this.solutionEvent.emit(solution);
    }
}