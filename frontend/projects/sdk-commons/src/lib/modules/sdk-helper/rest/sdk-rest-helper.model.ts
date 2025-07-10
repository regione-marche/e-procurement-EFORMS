import { HttpHeaders, HttpParams } from '@angular/common/http';

export interface IHttpParams {
    [param: string]: string | string[];
}

export interface IHttpHeaders {
    [param: string]: string | string[];
}

export interface IHttpOptions {
    headers?: HttpHeaders | IHttpHeaders;
    params?: HttpParams | IHttpParams;
    body?: any;
    withCredentials?: boolean;
    reportProgress?: boolean;
    observe: 'body';
    responseType: 'json';
}
