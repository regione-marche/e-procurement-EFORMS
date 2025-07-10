import { Injectable } from '@angular/core';
import { forEach, head, isArray, isEmpty, isUndefined, remove, size } from 'lodash-es';
import { Observable, Observer, of } from 'rxjs';

import { SdkLoggerService } from '../../sdk-logger/sdk-logger.service';
import { ISdkPool } from '../../sdk-shared/types/sdk-common.types';

@Injectable({
    providedIn: 'root'
})
export class SdkTokenPoolService {

    constructor(private logger: SdkLoggerService) { }

    public create<T>(resources: Array<T>): ISdkPool<T> {
        return new SdkTokenPool<T>(this.logger, resources);
    }

}

/**
 * Implementazione concreta del pool di token.
 * Classe non esportata
 */
class SdkTokenPool<T> implements ISdkPool<T> {

    private observers: Array<Observer<T>> = [];

    constructor(
        private logger: SdkLoggerService,
        private resources: Array<T> = []
    ) { }

    public stats(): Observable<any> {
        return of({ resources: this.resources });
    }

    public acquire(): Observable<T> {
        return new Observable<T>((ob: Observer<T>) => {
            this.observers.push(ob);
            this.tryAcquire();
        });
    }

    public release(res: T): Observable<void> {
        return new Observable<void>((ob: Observer<void>) => {
            this.pushResource(res);
            this.tryAcquire();

            ob.next(null);
            ob.complete();
        });
    }

    public destroy(): Observable<void> {
        return new Observable<void>((ob: Observer<void>) => {
            forEach(this.observers, (one: Observer<T>) => {
                one.error(new Error('Poll Destroyed'));
            });

            ob.next(null);
            ob.complete();
        });
    }

    private tryAcquire(): void {
        let res = this.randomResource();
        if (isUndefined(res)) {
            this.logger.warn('tryAcquire >>>', 'nessuna risorsa');
            return;
        }

        let ob = this.firstObserver();
        if (isUndefined(ob)) {
            this.logger.warn('tryAcquire >>>', 'nessun observer');
            return;
        }

        this.logger.debug('tryAcquire >>>', JSON.stringify({ res }));

        ob.next(res);
        ob.complete();

        this.removeResource(res);
    }

    private firstObserver(): Observer<T> {
        return head(this.observers.splice(0, 1));
    }

    private pushResource(res: T): void {
        this.resources.push(res);

        this.logger.debug('pushResource >>>', JSON.stringify(this.resources));
    }

    private randomResource(): T {
        if (isArray(this.resources) && isEmpty(this.resources) === false) {
            return this.resources[Math.floor(Math.random() * (size(this.resources) - 1))]; // NOSONAR
        }
        return undefined;
    }

    private removeResource(res: T): void {
        remove(this.resources, (curr: T) => {
            return res === curr;
        });
    }

}