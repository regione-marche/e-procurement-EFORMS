import { Injectable, Injector } from '@angular/core';
import { SdkBaseService, SdkLocalStorageService } from '@maggioli/sdk-commons';
import { cloneDeep, isObject } from 'lodash-es';

interface CachedData {
  data: any;
  expiration: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService extends SdkBaseService {
  constructor(inj: Injector) {
    super(inj);
  }

  setItem<T>(
    key: string,
    language: string,
    data: T,
    path: string,
    expirationDays: number = 1
  ): void {
    path = path + '|' + language;
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + expirationDays);
    const cachedData: CachedData = { data: data, expiration: expirationDate };
    this.sdkLocalStorageService.setItem(key, cachedData, path);
  }

  getItem<T>(key: string, language: string, path: string): T {
    path = path + '|' + language;
    const cachedData: CachedData = this.sdkLocalStorageService.getItem(
      key,
      path
    );
    if (
      isObject(cachedData) &&
      new Date(cachedData.expiration).getTime() >= new Date().getTime()
    ) {
      return cloneDeep(cachedData.data);
    }
    return null;
  }

  private get sdkLocalStorageService(): SdkLocalStorageService {
    return this.injectable(SdkLocalStorageService);
  }
}
