import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { isObject, join } from 'lodash-es';
import { Observable, of } from 'rxjs';

import {
    SdkBasicButtonOutput,
    SdkButtonGroupInput as SdkButtonGroupConfig,
    SdkButtonGroupOutput,
    SdkButtonGroupSingleInput,
} from '../../sdk-button.domain';


/**
 * Componente per renderizzare un button group
 */
@Component({
    selector: `sdk-button-group`,
    styleUrls: [`sdk-button-group.component.scss`],
    templateUrl: `sdk-button-group.component.html`,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkButtonGroupComponent extends SdkAbstractComponent<SdkButtonGroupConfig, void, SdkButtonGroupOutput> implements OnInit, OnDestroy {

    /**
     * @ignore
     */
    public config: SdkButtonGroupConfig;

    /**
     * @ignore
     */
    public buttonsLeft: Array<SdkButtonGroupSingleInput> = [];
    /**
     * @ignore
     */
    public buttonsRight: Array<SdkButtonGroupSingleInput> = [];

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
    protected onData(_data: void): void { }

    /**
     * @ignore
     */
    protected onOutput(data: SdkButtonGroupOutput): void { }

    /**
     * @ignore
     */
    protected onConfig(config: SdkButtonGroupConfig): void {
        this.markForCheck(() => {
            this.isReady = false;
        });
        this.markForCheck(() => {
            if (config != null) {
                this.config = { ...config };
                this.buttonsLeft = this.populateButtons(config, true);
                this.buttonsRight = this.populateButtons(config, false);
                this.isReady = true;
            }
        });
    }

    /**
     * @ignore
     */
    protected onUpdateState(state: boolean): void { }

    // #region Public

    /**
     * @ignore
     */
    public onClick(out: SdkBasicButtonOutput): void {
        this.emitOutput(out as SdkButtonGroupOutput);
    }

    /**
     * @ignore
     */
    public trackByCode(index: number, button: SdkButtonGroupSingleInput): string | number {
        return isObject(button) ? button.code : index;
    }

    /**
     * @ignore
     */
    public getBtnObs(button: SdkButtonGroupSingleInput): Observable<SdkButtonGroupSingleInput> { return of(button) }

    /**
     * @ignore
     */
    public getButtonClass(button: SdkButtonGroupSingleInput): string {
        let classes: Array<string> = ['sdk-button-group-item'];

        if (button.type != null) {
            classes.push(`sdk-button-group-item-${button.type}`);
        }

        return join(classes, ' ');
    }

    // #endregion

    // #region Private

    /**
     * @ignore
     */
    private populateButtons(config: SdkButtonGroupConfig, left: boolean = false): Array<SdkButtonGroupSingleInput> {
        const buttonsList: Array<SdkButtonGroupSingleInput> = new Array();
        if (config != null && config.buttons != null) {
            config.buttons.forEach((button: SdkButtonGroupSingleInput) => {
                if (button.type == null) {
                    if (!left) {
                        buttonsList.push(button);
                    }
                } else {
                    // check type
                    switch (button.type) {
                        case 'primary':
                            if (!left) {
                                buttonsList.push(button);
                            }
                            break;
                        case 'cancel':
                            if (left) {
                                buttonsList.push(button);
                            }
                            break;
                        case 'functions':
                            if (left) {
                                buttonsList.push(button);
                            }
                            break;
                    }
                }
            });
        }
        return buttonsList;
    }

    // #endregion
}
