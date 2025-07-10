import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { IDictionary, SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { isEmpty, isObject, join } from 'lodash-es';

import {
    ESdkButtonLook,
    SdkBasicButtonInput as SdkBasicButtonConfig,
    SdkBasicButtonInput,
    SdkBasicButtonOutput,
} from '../../sdk-button.domain';

/**
 * Componente per renderizzare un basic button
 */
@Component({
    selector: `sdk-basic-button`,
    templateUrl: `sdk-basic-button.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkBasicButtonComponent extends SdkAbstractComponent<SdkBasicButtonConfig, void, SdkBasicButtonOutput> implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    public config: SdkBasicButtonConfig;

    /**
     * @ignore
     */
    constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

    /**
     * @ignore
     */
    protected onInit(): void { }

    /**
     * @ignore
     */
    protected onAfterViewInit(): void { }

    /**
     * @ignore
     */
    protected onDestroy(): void { }

    /**
     * @ignore
     */
    protected onConfig(config: SdkBasicButtonConfig): void {
        this.markForCheck(() => {
            if (isObject(config)) {
                this.config = config;
                this.isReady = true;
            }
        });
    }

    /**
     * @ignore
     */
    protected onData(_data: void): void { }

    /**
     * @ignore
     */
    protected onOutput(_data: SdkBasicButtonOutput): void { }

    /**
     * @ignore
     */
    protected onUpdateState(state: boolean): void { }

    // #region Getters

    private get translateService(): TranslateService { return this.injectable(TranslateService) }

    // #endregion

    // #region Public

    /**
     * @ignore
     */
    public onClick(_event: MouseEvent): void {
        let obj: SdkBasicButtonOutput = { code: this.config.code, provider: this.config.provider };
        this.emitOutput(obj);
    }

    /**
     * @ignore
     */
    public getTranslatedLabel(label: string, labelParams: IDictionary<any>, look: ESdkButtonLook): string {
        if (look != null && look == 'icon') {
            return undefined;
        }
        if (!isEmpty(label)) {
            return this.translateService.instant(label, labelParams);
        }
        return undefined;
    }

    /**
     * @ignore
     */
    public getTranslatedTitle(title: string, label?: string, labelParams?: IDictionary<any>): string {
        if (!isEmpty(title)) {
            return this.translateService.instant(title);
        } else if (!isEmpty(label)) {
            return this.translateService.instant(label, labelParams);
        }
        return undefined;
    }

    /**
     * @ignore
     */
    public getClasses(config: SdkBasicButtonInput, responsive: boolean = false): string {
        if (isObject(config)) {
            let classes: Array<string> = new Array();
            if (config.look) {
                if (config.look === 'flat') {
                    classes.push('sdk-button-flat');
                } else if (config.look === 'outline') {
                    classes.push('sdk-button-outline');
                } else if (config.look == 'icon') {
                    classes.push('sdk-button-icon');
                }
            }
            if (config.buttonClasses != null) {
                classes = [...classes, ...config.buttonClasses];
            }

            if (responsive) {
                classes.push('sdk-button-responsive');
            } else {
                classes.push('sdk-button-no-responsive');
            }

            return join(classes, ' ');
        }
        return undefined;
    }

    /**
     * @ignore
     */
    public getIcon(config: SdkBasicButtonInput): string {
        if (isObject(config) && config.icon) {
            return config.icon;
        }
        return undefined;
    }

    // #endregion
}
