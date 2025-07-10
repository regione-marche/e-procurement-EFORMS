import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { IDictionary, SdkSessionStorageService } from '@maggioli/sdk-commons';
import { Observable } from 'rxjs';
import { Constants } from '../app.constants';

export function authenticationInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
    let sdkSessionStorageService: SdkSessionStorageService = inject(SdkSessionStorageService);
    let jwtToken: string = sdkSessionStorageService.getItem(Constants.TOKEN_SESSION_KEY);
    if (jwtToken != null) {
        let headers: IDictionary<any> = {
            'Authorization': `Bearer ${jwtToken}`
        };

        headers = {
            ...headers
        };

        req = req.clone(
            {
                setHeaders: headers
            }
        );
    }
    return next(req);
}
