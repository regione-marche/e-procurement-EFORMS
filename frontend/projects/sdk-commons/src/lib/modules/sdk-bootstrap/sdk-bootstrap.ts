import { enableProdMode, Type, ViewEncapsulation } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { from } from 'rxjs';
import 'zone.js';

export function bootstrapModule<M>(environment: any, module: Type<M>) {
    if (environment.production) {
        enableProdMode();
    }

    let promise = platformBrowserDynamic().bootstrapModule(module, {
        defaultEncapsulation: ViewEncapsulation.Emulated,
        ngZone: 'zone.js'
    })

    return from(promise);
}
