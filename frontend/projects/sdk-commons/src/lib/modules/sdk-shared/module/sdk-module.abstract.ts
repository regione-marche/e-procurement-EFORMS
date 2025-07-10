import { Injector, Type } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { TranslateService } from '@ngx-translate/core';
import { forEach, get, isEmpty } from 'lodash-es';
import { of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { SdkSessionContextService } from '../../sdk-context/session/sdk-session-context.service';
import { SdkLoggerService } from '../../sdk-logger/sdk-logger.service';
import { SdkLangEnum } from '../enums/sdk-lang.enums';
import { IDictionary } from '../types/sdk-common.types';
import { ISdkWidget } from '../types/sdk-widget.types';

export abstract class SdkAbstractModule {

    public constructor(private _module: string, private _widgets: Array<Type<ISdkWidget>>, private _inj: Injector) { }

    public ngDoBootstrap(): void {
        this.logger.debug(`ngDoBootstrap >>> ${this.module} >>> begin`);

        of(null).pipe(
            mergeMap(this.context()),
            mergeMap(this.language()),
            mergeMap(this.elements()),
        ).subscribe(() => {
            this.logger.debug(`ngDoBootstrap >>> ${this.module} >>> end`);
        });
    }

    // #region Private

    private elements = () => () => of(this.registerAll())

    private context = () => () => this.session.start()

    private language = () => (sess: IDictionary<any>) => of(this.setupLang(sess))

    private setupLang = (sess: IDictionary<any>) => {
        let lang: string = get(sess, `${SdkLangEnum.Language}.${SdkLangEnum.ActiveUILanguage}`);

        this.logger.debug(`language >>> ${this._module} >>> ${lang}`);

        // this language will be used as a fallback when a translation isn't found in the current language
        this.translate.setDefaultLang(lang);

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        this.translate.use(lang);

        // manage change language
        this.session.observable$.subscribe((data: IDictionary<any>) => {

            // recupero dalla sessione la lingua corrente
            const curr: string = get(data, `${SdkLangEnum.Language}.${SdkLangEnum.ActiveUILanguage}`);

            this.logger.debug(`session changed >>> ${this._module} >>> lang: ${lang} >>> curr: ${curr}`);

            // cambio la lingua dell'interfaccia se differisce
            if (lang !== curr) { this.translate.use(lang = curr) }

        });

    }

    private registerAll = () => forEach(this._widgets, (one: Type<ISdkWidget>) => this.registerOne(one));

    private registerOne(clazz: Type<ISdkWidget>): void {
        try {

            // ottengo il selector del widget istanziandolo
            const selector = (new clazz()).widget;

            if (isEmpty(selector) === false) {

                this.logger.debug(`registerComponent >>> ${this.module} >>> ${selector}`);

                customElements.define(selector, createCustomElement(clazz, { injector: this._inj }));

            }

        } catch (err) {
            this.logger.error(err);
        }
    }

    // #endregion

    // #region Protected

    protected injectable<T>(token: Type<T>): T { return this._inj.get(token) }

    // #endregion

    // #region Getters

    protected get module(): string { return this._module }

    protected get session(): SdkSessionContextService { return this.injectable(SdkSessionContextService) }

    protected get translate(): TranslateService { return this.injectable(TranslateService) }

    protected get logger(): SdkLoggerService { return this.injectable(SdkLoggerService) }

    // #endregion

}
