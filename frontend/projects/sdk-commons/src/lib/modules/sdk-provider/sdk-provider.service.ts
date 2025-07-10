import { Injectable, Injector, Type } from '@angular/core';
import { isObject } from 'lodash-es';
import { Observable } from 'rxjs';
import { SdkBaseService } from '../sdk-base/sdk-base.service';

import { IDictionary } from '../sdk-shared/types/sdk-common.types';
import { SdkProvider } from '../sdk-shared/types/sdk-provider.types';

@Injectable({ providedIn: 'root' })
export class SdkProviderService extends SdkBaseService {

    private map: IDictionary<Type<SdkProvider>>;

    constructor(private inj: Injector) {
        super(inj);
    }

    public init(map: IDictionary<Type<SdkProvider>>): void { this.map = map }

    public run(code: string, args?: IDictionary<any> | any): Observable<IDictionary<any>> | any {

        if (isObject(this.map) === false) { throw new Error('IDictionary<Type<SdkProvider>> non inizializzata') }

        let providerType = this.map[code];

        if (isObject(providerType) === false) {
            this.logger.error(`SdkProviderType non definito ${code}`);
            throw new Error('SdkProviderType non definito');
        }

        let providerInstance = this.inj.get(providerType);

        if (isObject(providerType) === false) { throw new Error('providerInstance non trovata') }

        return providerInstance.run(args);

    }

}
