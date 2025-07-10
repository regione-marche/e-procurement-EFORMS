import { Injectable, Injector, Type } from '@angular/core';
import { get, isEqual } from 'lodash-es';
import { Observable, pipe, Subject } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { SdkBaseService } from '../sdk-base/sdk-base.service';
import { IDictionary } from '../sdk-shared/types/sdk-common.types';
import { SdkReducer, SdkStateMap, SdkStoreAction } from './sdk-store.domain';
import { reducer } from './sdk-store.reducer';

/**
 * Store Service
 */
@Injectable({ providedIn: 'root' })
export class SdkStoreService extends SdkBaseService {

    private actions$: Subject<SdkStoreAction>;
    private state$: Observable<SdkStateMap>;

    constructor(private inj: Injector) {
        super(inj);
    }

    public init(state: SdkStateMap, map: IDictionary<Type<SdkReducer>>): void {
        this.actions$ = new Subject<SdkStoreAction>();
        this.state$ = this.actions$.pipe(reducer(this.inj, state, map), shareReplay(1));
    }

    public dispatch<T = any>(action: SdkStoreAction<T>): void {
        this.logger.debug('SdkStoreService::dispatch', action.type);
        if (action) { this.actions$.next(action); }
    }

    public state(): Observable<SdkStateMap> { return this.state$ }

    public select<T = any>(path: string): Observable<T> {
        this.logger.debug('SdkStoreService::select', path);
        return this.state$.pipe(this.slice(path));
    }

    private slice = (path: string) => pipe(
        map(state => this.getAll(state, path, null)),
        distinctUntilChanged(isEqual)
    )

    private getAll(state: any, path: string, defaultState: any): any {
        if (state == null || path == null) {
            return null;
        }
        if (path == '') {
            return state;
        }
        return get(state, path, defaultState);
    }

}
