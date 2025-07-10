import { get, has, keys, merge, set, unset } from 'lodash-es';
import { Observable, Observer, Subject } from 'rxjs';

import { IDictionary, ISdkDictionaryProvider } from '../../sdk-shared/types/sdk-common.types';

export abstract class SdkAbstractContextService {

    private get KEY(): string { return `context`; }

    private subject$ = new Subject<IDictionary<any>>();

    public observable$ = this.subject$.asObservable();

    constructor(private provider: ISdkDictionaryProvider) { }

    private get context(): IDictionary<any> {
        return this.provider.dictionary(this.KEY);
    }

    private set context(val: IDictionary<any>) {
        this.provider.dictionary(this.KEY, val);
    }

    public start(map: IDictionary<any> = {}, force: boolean = false): Observable<IDictionary<any>> {
        return new Observable<IDictionary<any>>((ob: Observer<IDictionary<any>>) => {

            this.context = (force === true)
                ? merge({}, map)
                : merge(this.context, map);

            ob.next(this.context);
            ob.complete();

            this.next();
        });
    }

    public fill(map: IDictionary<any>): Observable<void> {
        return new Observable<void>((ob: Observer<void>) => {

            this.context = merge(this.context, map);

            ob.next(null);
            ob.complete();

            this.next();
        });
    }

    public export(): Observable<IDictionary<any>> {
        return new Observable<IDictionary<any>>((ob: Observer<IDictionary<any>>) => {
            ob.next(this.context);
            ob.complete();
        });
    }

    public destroy(): Observable<void> {
        return new Observable<void>((ob: Observer<void>) => {

            this.context = undefined;

            ob.next(null);
            ob.complete();

            this.next();
        });
    }

    public getAttribute<T>(key: string): Observable<T> {
        return new Observable<T>((ob: Observer<T>) => {

            const val = get(this.context, key);

            ob.next(val);
            ob.complete();
        });
    }

    public setAttribute<T>(key: string, val?: T): Observable<void> {
        return new Observable<void>((ob: Observer<void>) => {

            set(this.context, key, val);

            ob.next(undefined);
            ob.complete();

            this.next();
        });
    }

    public unsetAttribute(key: string): Observable<void> {
        return new Observable<void>((ob: Observer<void>) => {

            unset(this.context, key);

            ob.next(undefined);
            ob.complete();

            this.next();
        });
    }

    public hasAttribute(key: string): Observable<boolean> {
        return new Observable<boolean>((ob: Observer<boolean>) => {

            const res = has(this.context, key);

            ob.next(res);
            ob.complete();
        });
    }

    public attributeKeys(): Observable<Array<string>> {
        return new Observable<Array<string>>((ob: Observer<Array<string>>) => {

            const res = keys(this.context);

            ob.next(res);
            ob.complete();
        });
    }

    private next(): void {
        this.subject$.next(this.context);
    }

}
