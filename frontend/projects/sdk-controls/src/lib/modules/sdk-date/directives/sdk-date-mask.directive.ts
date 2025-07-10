import { AfterViewChecked, Directive, ElementRef, HostListener, Input, OnDestroy, Renderer2 } from '@angular/core';
import { Calendar } from 'primeng/calendar';
import { Subscription } from 'rxjs';

import { MaskingBase } from '../utils/masking-base';

/**
 * Importata
 */
@Directive({
    selector: '[sdkDateMask]'
})
export class SdkDateMaskDirective extends MaskingBase implements AfterViewChecked, OnDestroy {

    /**
     * @ignore
     */
    private selectSubscriber: Subscription;
    /**
     * @ignore
     */
    private listener: () => void;

    /**
     * @ignore
     */
    constructor(private el: ElementRef, private host: Calendar, private renderer: Renderer2) {
        super();
    }

    /**
     * @ignore
     */
    @Input() customDateFormat;

    /**
     * @ignore
     */
    @Input() set slotChar(value: string) {
        this._slotChar = value;
    }

    /**
     * @ignore
     */
    @Input() set showPlaceholder(value: boolean) {
        this._showPlaceholder = value;
    }

    /**
     * @ignore
     */
    private firstTime = true;

    /**
     * @ignore
     */
    private setMask() {
        this._mask = "";
        if (!this.host.timeOnly) {
            const dateFormat = this.customDateFormat || this.host.dateFormat;
            for (const dateFormatItem of dateFormat) {
                if (dateFormatItem === "d" || dateFormatItem === "m" || dateFormatItem === "y") {
                    this._mask += "9";
                    if (dateFormatItem === "y") {
                        this._mask += "9";
                    }
                } else {
                    this._mask += dateFormatItem;
                }
            }
        }
        if (this.host.showTime || this.host.timeOnly) {
            if (!this.host.timeOnly) {
                this._mask += " ";
            }
            this._mask += "99:99";
            if (this.host.showSeconds) {
                this._mask += ":99";
            }
        }
    }

    /**
     * @ignore
     */
    @HostListener("input")
    private onInput() {
        if (this._input === null) {
            this._input = this.host.inputfieldViewChild.nativeElement;
        }
        this.checkValue();
    }

    /**
     * @ignore
     */
    @HostListener("blur")
    onBlur() {
        this.blurEvent();
    }

    /**
     * @ignore
     */
    private onFocus() {
        if (this.customDateFormat && this.host.value) {
            // this._input.value = this.value;
            this.checkValue(true);
            this._input.selectionStart = this.value.length;
            this._input.selectionEnd = this.value.length;
            return;
        }
        this.checkValue(true);
    }

    /**
     * @ignore
     */
    override updateInput() {
        super.updateInput();
        if (this.value.length === this._mask.length && this.value.indexOf(this._slotChar) === -1) {
            try {
                if (!this.customDateFormat) {
                    const date: any = this.host.parseValueFromString(this.value);
                    if (this.host.isSelectable(date.getDate(), date.getMonth(), date.getFullYear(), false)) {
                        this.host.updateModel(date);
                        this.host.updateUI();
                    }
                } else {
                    let time;
                    if (this.value.indexOf(" ") !== -1) {
                        const sizeTrimmed = this.value.length - this.value.replace(/ /g, "").length;
                        time = this.value.split(" ")[sizeTrimmed];
                    }
                    const date1 = this.host.parseDate(this.value, this.customDateFormat);
                    if (this.host.isSelectable(date1.getDate(), date1.getMonth(), date1.getFullYear(), false)) {
                        if (time) {
                            const timeParts = time.split(":");
                            date1.setHours(timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0);
                        }
                        this.host.updateModel(date1);
                        this.host.updateUI();
                    }
                }
            } catch (err) {
                this.host.updateModel(null);
            }
        }
    }

    /**
     * @ignore
     */
    ngAfterViewChecked(): void {
        if (this.firstTime && this.host && this.host.inputfieldViewChild) {
            this.firstTime = false;
            this._input = this.host.inputfieldViewChild.nativeElement;
            this._input.type = "tel";
            this.setMask();
            this.listener = this.renderer.listen(this._input, "focus", () => {
                this.onFocus();
            });
            this.selectSubscriber = this.host.onSelect.subscribe((value) => {
                this.onSelect(value);
            });
        }
    }

    /**
     * @ignore
     */
    private onSelect(value) {
        if (this.customDateFormat) {
            let formattedValue = "";

            if (this.host.timeOnly) {
                formattedValue = this.host.formatTime(value);
            } else {
                formattedValue = this.host.formatDate(value, this.customDateFormat);
                if (this.host.showTime) {
                    formattedValue += " " + this.host.formatTime(value);
                }
            }
            this.value = formattedValue;
        }
    }

    /**
     * @ignore
     */
    ngOnDestroy(): void {
        this.listener();
        this.selectSubscriber.unsubscribe();
    }
}