import { Observable } from 'rxjs';

import { IDictionary } from './sdk-common.types';

export type SdkRenderConfig = SdkAppConfig | SdkContentConfig | SdkLayoutConfig;

export interface SdkAppConfig {
    name: string;
    styleUrls?: Array<string>;
    settings?: IDictionary<any>;
}

export interface SdkContentConfig {
    name: string;
    title: string;
    layout: string;
    appName: string;
    styleUrls?: Array<string>;
    settings?: IDictionary<any>;
    sections: Array<SdkLayoutSectionConfig>;
}

export interface SdkLayoutConfig {
    name: string;
    styleUrls?: Array<string>;
    settings?: IDictionary<any>;
    sections: Array<SdkLayoutSectionConfig>;
}

export interface SdkSectionConfig {
    id: string;
    parentId?: string;
    selector: string;
    settings: IDictionary<any>;
    description?: string;
    classNames?: string;
    sons?: Array<string>;
}

export interface SdkRenderMap { page: SdkContentConfig; layout: SdkLayoutConfig; app: SdkAppConfig }

export interface SdkLayoutSectionConfig extends SdkSectionConfig { }

export interface SdkPageSectionConfig extends SdkSectionConfig { }

export interface SdkLoader {
    load(url: string): Observable<SdkRenderConfig>
}

