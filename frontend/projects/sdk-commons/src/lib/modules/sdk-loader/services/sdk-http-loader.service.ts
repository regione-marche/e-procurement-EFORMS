import { Injectable, Injector } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

import { SdkBaseService } from '../../sdk-base/sdk-base.service';
import { SdkHttpLoaderAction, SdkHttpLoaderType } from './sdk-http-loader.model';

@Injectable({ providedIn: 'root' })
export class SdkHttpLoaderService extends SdkBaseService {

    private loaderSubject: Subject<SdkHttpLoaderAction> = new Subject();
    private _active: boolean;

    public loaderObservable$: Observable<SdkHttpLoaderAction> = this.loaderSubject.asObservable();

    constructor(inj: Injector) { super(inj); }

    public showLoader(type: SdkHttpLoaderType): void {
        this.loaderSubject.next({ active: true, type });
        this._active = true;
    }

    public hideLoader(): void {
        this.loaderSubject.next({ active: false, type: undefined });
        this._active = false;
    }

    public getLoaderSubject(): Subject<SdkHttpLoaderAction> {
        return this.loaderSubject;
    }

    public get active(): boolean {
        return this._active;
    }

    public sub(callback?: (value: SdkHttpLoaderAction) => void): Subscription {
        return this.loaderObservable$.subscribe(callback);
    }
}
