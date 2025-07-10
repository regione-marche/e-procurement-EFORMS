import { IDictionary } from '@maggioli/sdk-commons';

export interface SdkValidatorInput<Y> {
    config: SdkValidatorConfig;
    data: Y;
}

export interface SdkValidatorOutput {
    valid: boolean;
    messages: Array<SdkValidationMessage>;
}

export interface SdkValidationMessage {
    level: TSdkValidationMessageType;
    text: string;
    params?: IDictionary<any>;
}

export type TSdkValidationMessageType = 'success' | 'warning' | 'info' | 'error';

export interface SdkValidatorRequiredConfig { required: boolean }

export interface SdkValidatorRegexpConfig { regexp: RegExp }

export interface SdkValidatorEnumConfig<T> { values: Array<T> }

export type SdkValidatorConfig = SdkValidatorRequiredConfig | SdkValidatorRegexpConfig;

export type SdkValidatorFunction<Y> = (input: SdkValidatorInput<Y>) => SdkValidatorOutput;

export interface SdkValidator<Y> {
    config: SdkValidatorConfig;
    validator: SdkValidatorFunction<Y>;
    messages?: Array<SdkValidationMessage>;
}
