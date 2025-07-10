import { Injector } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

import { SdkBaseService } from '../sdk-base/sdk-base.service';

export class SdkBaseBehaviorSubjectService<T> extends SdkBaseService {

    private source$: BehaviorSubject<T>;
    private observable$: Observable<T>;

    constructor(inj: Injector, value: T) {
        super(inj);

        this.source$ = new BehaviorSubject<T>(value);
        this.observable$ = this.source$.asObservable();
    }

    public on(cb: (v: T) => void): Subscription { return this.observable$.subscribe(cb) }

    public emit(value: T): void { this.source$.next(value) }

    public getObservable(): Observable<T> { return this.observable$ };

}
