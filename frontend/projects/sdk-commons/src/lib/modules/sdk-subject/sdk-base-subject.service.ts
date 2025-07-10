import { Injector } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { SdkBaseService } from '../sdk-base/sdk-base.service';

export class SdkBaseSubjectService<T> extends SdkBaseService {

    private source$ = new Subject<T>();
    private observable$ = this.source$.asObservable();

    constructor(inj: Injector) { super(inj) }

    public get observable(): Observable<T> { return this.observable$ }

    public on(cb: (v: T) => void): Subscription { return this.observable$.subscribe(cb) }

    public emit(value: T): void { this.source$.next(value) }

}
