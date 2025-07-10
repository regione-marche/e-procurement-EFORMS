import { Directive, EventEmitter, Output } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';

import { ConfirmationService } from 'primeng/api';
import { TSdkFormFieldAlign } from '../../sdk-form.domain';

/**
 * Classe astratta estesa da tutti i componenti della form
 */
@Directive()
export abstract class SdkAbstractFormField<X, Y, Z> extends SdkAbstractComponent<X, Y, Z> {

    // #region Variables

    /**
     * @ignore
     */
    private _align: TSdkFormFieldAlign;

    /**
     * @ignore
     */
    public readonly DEFAULT_ALIGN_RIGHT_CLASS: string = 'align-right';
    /**
     * @ignore
     */
    @Output('outputInfoBox') public outputInfoBox$: EventEmitter<X> = new EventEmitter();
    /**
     * @ignore
     */
    @Output('onBlur') public onBlur$: EventEmitter<X> = new EventEmitter();
    /**
     * @ignore
     */
    @Output('onFocus') public onFocus$: EventEmitter<X> = new EventEmitter();

    // #endregion

    /**
     * @ignore
     */
    public get align(): TSdkFormFieldAlign {
        return this._align;
    }

    /**
     * @ignore
     */
    public set align(value: TSdkFormFieldAlign) {
        this._align = value;
    }

    /**
     * @ignore
     */
    public setAlignByConfig(config: any): void {
        this.align = config != null && config.align != null ? config.align : 'SX';
    }

    /**
     * @ignore
     */
    public get confirmationService(): ConfirmationService { return this.injectable(ConfirmationService) }

    /**
     * @ignore
     */
    protected emitOnBlur(config: X) {
        this.onBlur$.emit(config);
    }

    /**
     * @ignore
     */
    protected emitOnFocus(config: X) {
        this.onFocus$.emit(config);
    }
}