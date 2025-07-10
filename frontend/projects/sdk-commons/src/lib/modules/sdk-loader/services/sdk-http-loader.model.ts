export enum SdkHttpLoaderType {
    Initial = 1,
    Operation
}

export interface SdkHttpLoaderAction {
    active: boolean;
    type: SdkHttpLoaderType;
}
