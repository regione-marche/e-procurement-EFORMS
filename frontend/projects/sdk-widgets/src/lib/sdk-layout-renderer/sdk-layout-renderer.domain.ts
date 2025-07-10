export interface AppHomeIndexPanel {
    classNames?: string;
    targetUrl: string;
    authenticationUrl?: string;
    image?: SdkImageConfig;
    title?: SdkTextConfig;
    body?: SdkTextConfig;
    link: SdkTextConfig;
    panelCode: string;
    icon?: SdkIconConfig;
    disabled?: boolean;
}

export interface SdkImageConfig {
    classNames?: string;
    alt?: string;
    url: string;
}

export interface SdkTextConfig {
    classNames?: string;
    label: string;
}

export interface SdkIconConfig {
    icon: string;
    classNames?: string;
}