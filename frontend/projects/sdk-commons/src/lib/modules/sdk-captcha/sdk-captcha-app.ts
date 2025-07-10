import { BaseCaptcha } from './base-captcha';

export class SdkCaptchaApp {

    private baseElement: HTMLElement;
    private errorElement: HTMLElement;

    constructor(element: HTMLElement, errorElement: HTMLElement) {
        this.baseElement = element;
        this.errorElement = errorElement;

        this.init();
    }

    private init(): void {
        new BaseCaptcha(this.baseElement, this.errorElement);
    }
}