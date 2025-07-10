import { Injectable, Injector } from '@angular/core';
import { IDictionary, IHttpParams, SdkBaseService, SdkRestHelperService } from '@maggioli/sdk-commons';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ResponseResult, ValoreTabellato } from '../../model/lib.model';


@Injectable()
export class TabellatiService extends SdkBaseService {

    constructor(inj: Injector) { super(inj); }

    public listaValori(baseUrl: string, cod: string): Observable<Array<ValoreTabellato>> {

        let params: IHttpParams = {
            cod
        };

        return this.restHelper.get<ResponseResult<Array<ValoreTabellato>>>(`${baseUrl}/Valori`, params)
            .pipe(
                map((result: ResponseResult<Array<ValoreTabellato>>) => {
                    return result.data;
                })
            );
    }

    public getMultipleListaValori(baseUrl: string, codici: Array<string>): Observable<IDictionary<Array<ValoreTabellato>>> {

        let params: IHttpParams = {
            cods: codici
        };

        return this.restHelper.get<ResponseResult<IDictionary<Array<ValoreTabellato>>>>(`${baseUrl}/listaTabellati`, params)
            .pipe(
                map((result: ResponseResult<IDictionary<Array<ValoreTabellato>>>) => {
                    return result.data;
                })
            );
    }

    // #region gettetr

    private get restHelper(): SdkRestHelperService { return this.injectable(SdkRestHelperService) }

    // #endregion
}