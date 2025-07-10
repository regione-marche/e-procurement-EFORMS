import { Injectable } from '@angular/core';
import { cloneDeep, each, forIn, isEmpty, startsWith } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class SdkLocalStorageService {

  private divider: string = '|';

  public setItem(key: string, data: any, path?: string): void {
    let composedKey: string = key;
    if (path != null) {
      composedKey = this.getComposedKey(path, key);
    }
    localStorage.setItem(composedKey, JSON.stringify(data));
  }

  public getItem<T>(key: string, path?: string): T {
    let composedKey: string = key;
    if (path != null) {
      composedKey = this.getComposedKey(path, key);
    }
    let item = localStorage.getItem(composedKey);
    if (!isEmpty(item)) {
      return cloneDeep(JSON.parse(item) as T);
    }
    return undefined;
  }

  public removeItem(key: string, path?: string): void {
    let composedKey: string = key;
    if (path != null) {
      composedKey = this.getComposedKey(path, key);
    }
    localStorage.removeItem(composedKey);
  }

  public clear(path?: string): void {
    if (path != null) {
      this.clearPath(path);
    } else {
      localStorage.clear();
    }
  }

  private getComposedKey(path: string, key: string): string {
    return `${path}${this.divider}${key}`;
  }

  private getComposedPath(path: string): string {
    return `${path}${this.divider}`;
  }

  private clearPath(path: string): void {
    const arr: Array<string> = new Array();
    forIn(localStorage, (value: any, key: string) => {
      if (startsWith(key, this.getComposedPath(path))) {
        arr.push(key);
      }
    });
    each(arr, (one: string) => localStorage.removeItem(one));
  }
}
