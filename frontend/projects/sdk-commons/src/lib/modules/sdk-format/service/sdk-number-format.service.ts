import { Injectable, Injector } from '@angular/core';
import { isFinite, isString } from 'lodash-es';

import { SdkBaseService } from '../../sdk-base/sdk-base.service';

@Injectable()
export class SdkNumberFormatService extends SdkBaseService {

    constructor(inj: Injector) {
        super(inj);
    }

    /**
     * Metodo per convertire un numero in un determinato locale
     * @param value Numero javascript
     * @param locale Locale da utilizzare (es. it, en, ...)
     * @param minimumFractionDigits Numero massimo di decimali
     * @returns Numero stringa convertito
     */
    public formatNumber(value: number, locale: string, minimumFractionDigits?: number): string {
        if (isFinite(value) && isString(locale)) {
            if (isFinite(minimumFractionDigits)) {
                return new Intl.NumberFormat(locale, { minimumFractionDigits, useGrouping: true }).format(value);
            } else {
                return new Intl.NumberFormat(locale, { useGrouping: true }).format(value);
            }
        }
        return undefined;
    }

    /**
     *  Metodo per convertire un numero in una currency e secondo un determinato locale e ritornare il valore formattato senza simbolo della currency
     * @param value Numero javascript
     * @param locale Locale da utilizzare (es. it, en, ...)
     * @param minimumFractionDigits Parametro facoltativo per specificare il numero minimo di cifre decimali (default: 2)
     * @param maximumFractionDigits Parametro facoltativo per specificare il numero massimo di cifre decimali (default: 2)
     * @returns Numero stringa rappresentante la currency senza simbolo
     */
    public formatCurrencyNumber(value: number, locale: string, minimumFractionDigits: number = 2, maximumFractionDigits: number = 2): string {
        if (isFinite(value) && isString(locale)) {
            return new Intl.NumberFormat(locale, { minimumFractionDigits, maximumFractionDigits, useGrouping: true }).format(value);
        }
        return undefined;
    }

    /**
     *  Metodo per convertire un numero in una currency e secondo un determinato locale
     * @param value Numero javascript
     * @param locale Locale da utilizzare (es. it, en, ...)
     * @param currency Currency da utilizzare (es. EUR, ...)
     * @param minimumFractionDigits Parametro facoltativo per specificare il numero minimo di cifre decimali (default: 2)
     * @param maximumFractionDigits Parametro facoltativo per specificare il numero massimo di cifre decimali (default: 2)
     * @returns Numero stringa rappresentante la currency
     */
    public formatCurrencyString(value: number, locale: string, currency: string, minimumFractionDigits: number = 2, maximumFractionDigits: number = 2): string {
        if (isFinite(value) && isString(locale) && isString(currency)) {
            return new Intl.NumberFormat(locale, { style: 'currency', currency, minimumFractionDigits, maximumFractionDigits, useGrouping: true }).format(value);
        }
        return undefined;
    }

    /**
     * Metodo per l'estrazione del simbolo della currency
     * @param locale Locale da utilizzare (es. it, en, ...)
     * @param currency Currency da utilizzare (es. EUR, ...)
     * @returns Il simbolo della currency selezionata
     */
    public getCurrencySymbol(locale: string, currency: string) {
        return (0).toLocaleString(
            locale,
            {
                style: 'currency',
                currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }
        ).replace(/\d/g, '').trim()
    }
}