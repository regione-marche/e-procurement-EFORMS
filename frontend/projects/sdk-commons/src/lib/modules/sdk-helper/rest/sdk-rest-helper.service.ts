import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { merge, pickBy } from 'lodash-es';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SdkLoggerService } from '../../sdk-logger/sdk-logger.service';
import { IHttpHeaders, IHttpOptions, IHttpParams } from './sdk-rest-helper.model';

@Injectable({
  providedIn: 'root'
})
export class SdkRestHelperService {

  constructor(private httpClient: HttpClient, private logger: SdkLoggerService) { }

  get<T>(url: string, params?: IHttpParams, headers?: IHttpHeaders): Observable<T> {
    let options = this.options(pickBy(params), headers);

    return this.httpClient.get<T>(url, options).pipe(catchError((err: Error) => {
      this.logger.debug('RestHelper::get', url, options, err.stack);
      return throwError(() => err);
    }));
  }

  post<T>(url: string, body?: any, params?: IHttpParams, headers?: IHttpHeaders): Observable<T> {
    let options = this.options(params, headers);

    return this.httpClient.post<T>(url, body, options).pipe(catchError((err: Error) => {
      this.logger.debug('RestHelper::post', url, options, err.stack);
      return throwError(() => err);
    }));
  }

  upload<T>(url: string, body?: any, params?: IHttpParams): Observable<T> {
    return this.httpClient.post<T>(url, body).pipe(catchError((err: Error) => {
      this.logger.debug('RestHelper::upload', url, err.stack);
      return throwError(() => err);
    }));
  }

  put<T>(url: string, body?: any, params?: IHttpParams, headers?: IHttpHeaders): Observable<T> {
    let options = this.options(params, headers);

    return this.httpClient.put<T>(url, body, options).pipe(catchError((err: Error) => {
      this.logger.debug('RestHelper::put', url, options, err.stack);
      return throwError(() => err);
    }));
  }

  delete<T>(url: string, body?: any, params?: IHttpParams, headers?: IHttpHeaders): Observable<T> {
    let options = this.options(params, headers, body);

    return this.httpClient.delete<T>(url, options).pipe(catchError((err: Error) => {
      this.logger.debug('RestHelper::delete', url, options, err.stack);
      return throwError(() => err);
    }));
  }

  head<T>(url: string, params?: IHttpParams, headers?: IHttpHeaders): Observable<T> {
    let options = this.options(params, headers);

    return this.httpClient.head<T>(url, options).pipe(catchError((err: Error) => {
      this.logger.debug('RestHelper::head', url, options, err.stack);
      return throwError(() => err);
    }));
  }

  private options(params?: IHttpParams, headers?: IHttpHeaders, body?: any, observe: 'body' = 'body'): IHttpOptions {
    return { params, observe, body, headers: merge(this.headers(), headers), responseType: 'json', reportProgress: false };
  }

  private headers(): IHttpHeaders {
    return { 'Content-Type': 'application/json; charset=utf-8' };
  }
}
