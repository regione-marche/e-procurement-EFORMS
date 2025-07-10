import { Injectable, Injector } from '@angular/core';
import { isObject } from 'lodash-es';
import { Observable, Observer } from 'rxjs';

import { SdkBaseService } from '../sdk-base/sdk-base.service';
import { SdkHttpLoaderType } from '../sdk-loader/services/sdk-http-loader.model';
import { SdkHttpLoaderService } from '../sdk-loader/services/sdk-http-loader.service';
import { SdkLongOperationConfig } from './sdk-long-operation.model';

@Injectable({ providedIn: 'root' })
export class SdkLongOperationService extends SdkBaseService {
    public readonly DELAY: number = 1000;
    private computedDelay: number;

    constructor(inj: Injector) {
        super(inj);
    }

    public begin(config: SdkLongOperationConfig): Observable<any> {
        return new Observable((ob: Observer<any>) => {
            this.computedDelay = config.delay > this.DELAY ? config.delay : this.DELAY;
            this.sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Initial);
            config.pool().subscribe((response: any) => {
                if (isObject(response)) {
                    this._completed(config, ob, response);
                } else {
                    this._retry(config, ob, response);
                }
            }, (err: any) => {
                this._unsuccessful(ob, err, 'Operation failed');
            });
        });
    }

    // #region Private

    private _completed = (config: SdkLongOperationConfig, ob: Observer<any>, response: any) => {
        this.sdkHttpLoaderService.hideLoader();
        ob.next(response);
        ob.complete();
    }

    private _unsuccessful = (ob: Observer<any>, error: Error, message: any) => {
        this.sdkHttpLoaderService.hideLoader();
        setTimeout(() => {
            this.logger.error(message);
            ob.error(error);
            ob.complete();
        });
    }

    private _retry = (config: SdkLongOperationConfig, ob: Observer<any>, count: number = 0) => {

        setTimeout(() => this._polling(config, ob, count), this.computedDelay);
    }

    private _polling = (config: SdkLongOperationConfig, ob: Observer<any>, count: number) => {
        config.pool().subscribe((response: any) => {
            if (isObject(response)) {
                this._completed(config, ob, response);
            } else {
                if (count < config.maxIterations) {
                    this._retry(config, ob, count + 1);
                } else {
                    this._unsuccessful(ob, undefined, 'Operation timeout');
                }
            }
        }, (err: any) => {
            this._unsuccessful(ob, err, 'Operation failed');
        });
    }

    // #endregion

    // #region Getters

    private get sdkHttpLoaderService(): SdkHttpLoaderService { return this.injectable(SdkHttpLoaderService) }

    // #endregion
}
