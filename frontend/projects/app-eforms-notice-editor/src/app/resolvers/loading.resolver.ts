import { Injectable, Injector } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {
  IDictionary,
  SdkBaseService,
  SdkRouterService,
  SdkSessionStorageService
} from '@maggioli/sdk-commons';
import { Constants } from '../app.constants';
import { CryptoUtils } from '../utils/crypto-utils';

@Injectable({ providedIn: 'root' })
export class LoadingResolver extends SdkBaseService {
  constructor(inj: Injector) {
    super(inj);
  }

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): any {
    let token: string = route.queryParamMap.get('t');
    if (token != null) {
      let claims: IDictionary<any> = CryptoUtils.getJwtTokenClaims(token);

      this.manageUrls(claims);

      this._sdkSessionStorageService.setItem(
        Constants.TOKEN_SESSION_KEY,
        token
      );
      this.routerService.navigateToPage('integration-loader-page');
      return;
    }

    this.routerService.navigateToPage('home-page');
  }

  private manageUrls(claims: IDictionary<any>): void {
    // Save data get url
    let dataGetUrl: string = claims?.data?.dataGetUrl;

    if (dataGetUrl && dataGetUrl.endsWith('/'))
      dataGetUrl = dataGetUrl.substring(0, dataGetUrl.length - 1);

    this._sdkSessionStorageService.setItem(
      Constants.EXTERNAL_DATA_GET_INVOKING_URL,
      dataGetUrl
    );

    // Save keep alive url
    let keepAliveUrl: string = claims?.data?.keepAliveUrl;

    if (keepAliveUrl && keepAliveUrl.endsWith('/'))
      keepAliveUrl = keepAliveUrl.substring(0, keepAliveUrl.length - 1);

    this._sdkSessionStorageService.setItem(
      Constants.EXTERNAL_KEEP_ALIVE_INVOKING_URL,
      keepAliveUrl
    );

    // Save persistence url
    let persistenceUrl: string = claims?.data?.persistenceUrl;

    if (persistenceUrl && persistenceUrl.endsWith('/'))
      persistenceUrl = persistenceUrl.substring(0, persistenceUrl.length - 1);

    this._sdkSessionStorageService.setItem(
      Constants.EXTERNAL_PERSISTENCE_INVOKING_URL,
      persistenceUrl
    );
  }

  // #region Getters

  private get routerService(): SdkRouterService {
    return this.injectable(SdkRouterService);
  }

  private get _sdkSessionStorageService(): SdkSessionStorageService {
    return this.injectable(SdkSessionStorageService);
  }

  // #endregion
}
