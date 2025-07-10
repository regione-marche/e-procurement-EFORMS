import { inject, Injectable, Injector } from '@angular/core';
import {
  SdkBaseService,
  SdkRestHelperService,
  SdkSessionStorageService
} from '@maggioli/sdk-commons';
import { isEmpty } from 'lodash-es';
import { Observable, tap } from 'rxjs';
import { Constants } from '../app.constants';
import {
  IAppaltiBaseResponse,
  IAppaltiKeepAlive,
  IAppaltiLoadInitialData,
  IAppaltiPersistenceRequest
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class ExternalIntegrationService extends SdkBaseService {
  private _sdkRestHelperService: SdkRestHelperService =
    inject(SdkRestHelperService);

  private _sdkSessionStorageService: SdkSessionStorageService = inject(
    SdkSessionStorageService
  );

  constructor(inj: Injector) {
    super(inj);
  }

  // #region Public

  public loadInitialData(): Observable<IAppaltiLoadInitialData> {
    let url: string = this._sdkSessionStorageService.getItem(
      Constants.EXTERNAL_DATA_GET_INVOKING_URL
    );

    if (isEmpty(url)) {
      throw new Error('Data Get Url empty!');
    }

    return this._sdkRestHelperService.get<IAppaltiLoadInitialData>(url).pipe(
      tap((response: IAppaltiLoadInitialData) => {
        this.logger.debug('loadInitialData >>>', response);
      })
    );
  }

  public keepAlive(): Observable<IAppaltiKeepAlive> {
    let url: string = this._sdkSessionStorageService.getItem(
      Constants.EXTERNAL_KEEP_ALIVE_INVOKING_URL
    );

    if (isEmpty(url)) {
      throw new Error('Keep Alive Url empty!');
    }

    return this._sdkRestHelperService.post<IAppaltiKeepAlive>(url).pipe(
      tap((response: IAppaltiKeepAlive) => {
        this.logger.debug('keepAlive >>>', response);
      })
    );
  }

  public persistence(
    request: IAppaltiPersistenceRequest
  ): Observable<IAppaltiBaseResponse> {
    let url: string = this._sdkSessionStorageService.getItem(
      Constants.EXTERNAL_PERSISTENCE_INVOKING_URL
    );

    if (isEmpty(url)) {
      throw new Error('Persistence Url empty!');
    }

    return this._sdkRestHelperService
      .post<IAppaltiBaseResponse>(url, request)
      .pipe(
        tap((response: IAppaltiBaseResponse) => {
          this.logger.debug('persistence >>>', response);
        })
      );
  }

  // #endregion
}
