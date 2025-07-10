import { Injectable, Injector } from '@angular/core';

import { SdkBaseService } from '../../sdk-base/sdk-base.service';

@Injectable({ providedIn: 'root' })
export class SdkBase64Helper extends SdkBaseService {

    constructor(inj: Injector) {
        super(inj);
    }

    public base64ToArrayBuffer(str: string): Uint8Array {
        const binaryString = atob(str);
        const binaryLen = binaryString.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            const ascii = binaryString.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }

    public stringToArrayBuffer(str: string): Uint8Array {
        const binaryLen = str.length;
        const bytes = new Uint8Array(binaryLen);
        for (let i = 0; i < binaryLen; i++) {
            const ascii = str.charCodeAt(i);
            bytes[i] = ascii;
        }
        return bytes;
    }
}