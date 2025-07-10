import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    Input,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { each, find, forOwn, get, has, isEmpty, keys, min } from 'lodash-es';

import { SdkDropdownButtonData } from '../../sdk-button.domain';

/**
 * Componente per la renderizzazione del contenuto di un dropdown renderizzato dal baloon
 */
@Component({
    selector: 'sdk-dropdown-data',
    templateUrl: './sdk-dropdown-data.component.html',
    styleUrls: ['./sdk-dropdown-data.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkDropdownDataComponent implements OnInit, AfterViewInit {
    /**
     * @ignore
     */
    @HostBinding('class') classNames = 'sdk-dropdown-data';

    /**
     * @ignore
     */
    @ViewChild('dropdown') public _dropdown: ElementRef

    /**
     * @ignore
     */
    @Input() public input: Array<SdkDropdownButtonData>;

    /**
     * @ignore
     */
    public dropdownButtons: Array<SdkDropdownButtonData>;

    /**
     * @ignore
     */
    @Output() fit$: EventEmitter<void> = new EventEmitter();
    /**
     * @ignore
     */
    @Output() close$: EventEmitter<SdkDropdownButtonData> = new EventEmitter();

    /**
     * @ignore
     */
    constructor() { }

    // #region Hooks

    /**
     * @ignore
     */
    public ngOnInit(): void {
        if (this.input != null) {
            this.dropdownButtons = [...this.input];
            let groupMap: IDictionary<number> = {};
            // Verifica raggruppamenti
            for (let i = 0; i < this.dropdownButtons.length; i++) {
                let item = this.dropdownButtons[i];
                if (!isEmpty(item.buttonGroupId) && (!has(groupMap, item.buttonGroupId) || get(groupMap, item.buttonGroupId) < i)) {
                    // se e' un gruppo, la mappa non ha il group id oppure il valore contenuto e' minore dell'indice
                    // aggiorno il valore
                    groupMap[item.buttonGroupId] = i;
                }
            }

            each(keys(groupMap), (one: string) => {
                let index: number = get(groupMap, one);
                if (index < this.dropdownButtons.length - 1) {
                    this.dropdownButtons[index].lastItemOfGroup = true;
                }
            });

        }
    }

    /**
     * @ignore
     */
    public ngAfterViewInit(): void {
        this.fit$.emit();
        if (this.dropdown.getElementsByClassName('rdbi') != null && this.dropdown.getElementsByClassName('rdbi').length > 0) {
            (this.dropdown.getElementsByClassName('rdbi')[0] as HTMLElement).focus();
        }
    }

    // #endregion

    // #region Public

    /**
     * @ignore
     */
    public itemClick(item: SdkDropdownButtonData): void {
        if (item != null) {
            this.close$.emit({ ...item });
        }
    }

    // #endregion

    // #region Private

    /**
     * @ignore
     */
    private get dropdown(): HTMLElement {
        return this._dropdown != null ? this._dropdown.nativeElement : null;
    }

    /**
     * @ignore
     */
    private getLowestGroupId(groupMap: IDictionary<Array<number>>): string {
        let groupId: string;
        let minValue: number;
        forOwn(groupMap, function (value: Array<number>, key: string) {
            if (minValue == null || min(value) < minValue) {
                groupId = key;
                minValue = min(value);
            }
        });

        return groupId;
    }

    // #endregion
}