import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { IDictionary, IHttpParams, SdkRestHelperService } from '@maggioli/sdk-commons';
import { map, Observable } from 'rxjs';
import { BACKEND_URL } from '../app.constants';
import {
  CvsOutputDTO,
  HomePageInfoDTO,
  NoticeSubtypesDetailDTO,
  NoticeTypesDTO,
  ResponseResult
} from '../models/api.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private _backendUrl: string = inject(BACKEND_URL);
  private _sdkRestHelperService: SdkRestHelperService = inject(SdkRestHelperService);
  private _httpClient: HttpClient = inject(HttpClient);

  public loadInfo(): Observable<ResponseResult<HomePageInfoDTO>> {
    let url = `${this._backendUrl}/sdk/info`;
    return this._sdkRestHelperService.get<ResponseResult<HomePageInfoDTO>>(url);
  }

  public loadNoticeTypes(sdkVersion: string): Observable<ResponseResult<NoticeTypesDTO>> {
    let url = `${this._backendUrl}/sdk/${sdkVersion}/notice-types`;
    return this._sdkRestHelperService.get<ResponseResult<NoticeTypesDTO>>(url);
  }

  public loadNoticeSubTypes(sdkVersion: string): Observable<ResponseResult<NoticeSubtypesDetailDTO>> {
    let url = `${this._backendUrl}/sdk/${sdkVersion}/notice-sub-types-details`;
    return this._sdkRestHelperService.get<ResponseResult<NoticeSubtypesDetailDTO>>(url);
  }

  public loadNoticeTypesStandalone(sdkVersion: string): Observable<ResponseResult<NoticeSubtypesDetailDTO>> {
    let url = `${this._backendUrl}/sdk/${sdkVersion}/notice-types-standalone`;
    return this._sdkRestHelperService.get<ResponseResult<NoticeSubtypesDetailDTO>>(url);
  }

  public loadSingleNoticeType(sdkVersion: string, noticeType: string): Observable<ResponseResult<IDictionary<any>>> {
    let url = `${this._backendUrl}/sdk/${sdkVersion}/notice-types/${noticeType}`;
    return this._sdkRestHelperService.get<ResponseResult<IDictionary<any>>>(url);
  }

  public loadBasicMetadata(sdkVersion: string): Observable<ResponseResult<IDictionary<any>>> {
    let url = `${this._backendUrl}/sdk/${sdkVersion}/basic-meta-data`;
    return this._sdkRestHelperService.get<ResponseResult<IDictionary<any>>>(url);
  }

  public loadTranslations(sdkVersion: string, langCode: string): Observable<IDictionary<any>> {
    let url = `${this._backendUrl}/sdk/${sdkVersion}/translations/${langCode}.json`;
    return this._sdkRestHelperService.get<ResponseResult<IDictionary<any>>>(url);
  }

  public loadCodeLists(
    sdkVersion: string,
    langCode: string,
    codeListId: string
  ): Observable<ResponseResult<IDictionary<any>>> {
    let url = `${this._backendUrl}/sdk/${sdkVersion}/codelists/${codeListId}/lang/${langCode}`;
    return this._sdkRestHelperService.get<ResponseResult<IDictionary<any>>>(url);
  }

  public xmlGeneration(visualModel: string): Observable<ResponseResult<any>> {
    let url = `${this._backendUrl}/xml/notice/save/validation/none`;
    return this._sdkRestHelperService.post<ResponseResult<any>>(url, visualModel);
  }

  public xsdValidation(visualModel: string): Observable<ResponseResult<any>> {
    let url = `${this._backendUrl}/xml/notice/save/validation/xsd`;
    return this._sdkRestHelperService.post<ResponseResult<any>>(url, visualModel);
  }

  public cvsValidation(
    visualModel: string,
    sdkVersion: string,
    langCode: string
  ): Observable<ResponseResult<CvsOutputDTO>> {
    let params: IHttpParams = {
      sdkVersion: sdkVersion,
      langCode: langCode
    };

    let url = `${this._backendUrl}/xml/notice/save/validation/cvs`;
    return this._sdkRestHelperService.post<ResponseResult<CvsOutputDTO>>(url, visualModel, params);
  }

  public pdfPreview(visualModel: string): Observable<any> {
    let options = this.options(null, 'body', 'blob');

    let url = `${this._backendUrl}/xml/notice/save/render`;
    return this._httpClient.post<any>(url, visualModel, options);
  }

  public canActivate(slugId: string): Observable<boolean> {
    let url = `${this._backendUrl}/navigation/can-activate/${slugId}`;
    return this._sdkRestHelperService
      .get<ResponseResult<boolean>>(url)
      .pipe(map((result: ResponseResult<boolean>) => result.data));
  }

  private options(body?: any, observe: 'body' = 'body', responseType: string = 'json'): IDictionary<any> {
    return {
      observe,
      body,
      headers: this.headers(),
      responseType: responseType,
      reportProgress: false
    };
  }

  private headers(): IDictionary<any> {
    return { 'Content-Type': 'application/json; charset=utf-8' };
  }
}
