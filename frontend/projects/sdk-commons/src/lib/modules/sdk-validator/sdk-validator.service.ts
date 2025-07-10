import { Injectable, Injector, Type } from '@angular/core';
import { isObject } from 'lodash-es';

import { IDictionary } from '../sdk-shared/types/sdk-common.types';
import { SdkValidatorServiceFunction } from '../sdk-shared/types/sdk-validator-service-function.types';
import { SdkValidatorFunction } from './sdk-validator.domain';

@Injectable({ providedIn: 'root' })
export class SdkValidatorService {

    private map: IDictionary<Type<SdkValidatorServiceFunction>>;

    constructor(private inj: Injector) { }

    public init(map: IDictionary<Type<SdkValidatorServiceFunction>>): void { this.map = map }

    public run(code: string, args?: any): SdkValidatorFunction<any> {

        if (isObject(this.map) === false) { throw new Error('IDictionary<Type<SdkValidatorServiceFunction>> non inizializzata') }

        let providerType = this.map[code];

        if (isObject(providerType) === false) { throw new Error('SdkValidatorServiceFunctionType non definito') }

        let providerInstance = this.inj.get(providerType);

        if (isObject(providerInstance) === false) { throw new Error('providerInstance non trovata') }

        return providerInstance.run(args);

    }

}
