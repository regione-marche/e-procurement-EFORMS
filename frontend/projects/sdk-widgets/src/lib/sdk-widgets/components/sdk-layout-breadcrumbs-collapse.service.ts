import { Injectable, Injector } from '@angular/core';
import { SdkBaseService } from '@maggioli/sdk-commons';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SdkLayoutBreadcrumbsCollapseService extends SdkBaseService {

    // #region Declaration

    private _collapseSubj: BehaviorSubject<boolean>;
    private _collapseObs: Observable<boolean>;
    private _collapseStatus: boolean;

    // #endregion

    constructor(inj: Injector) {
        super(inj);
        this._collapseSubj = new BehaviorSubject(false);
        this._collapseObs = this._collapseSubj.asObservable();
        this._collapseStatus = false;
    }

    // #region Public

    public get collapseObservable$(): Observable<boolean> {
        return this._collapseObs;
    }

    public sub(callback?: (value: boolean) => void): Subscription {
        return this.collapseObservable$.subscribe(callback);
    }

    public collapse(): void {
        this._collapseSubj.next(true);
        this._collapseStatus = true;
    }

    public expand(): void {
        this._collapseSubj.next(false);
        this._collapseStatus = false;
    }

    public get collapseStatus(): boolean {
        return this._collapseStatus;
    }

    // #endregion

    // #region Private

    // #endregion
}