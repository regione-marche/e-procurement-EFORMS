import { SdkValidatorFunction } from '../../sdk-validator/sdk-validator.domain';

export interface SdkValidatorServiceFunction {
    run(args?: any): SdkValidatorFunction<any>;
}
