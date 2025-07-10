import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class SdkUuidHelperService {

    private static HEX_DIGITS: string = '0123456789abcdef';

    public constructor() { }

    public v1(): string {
        let s: Array<any> = [];

        for (let i = 0; i < 36; i++) {
            s[i] = SdkUuidHelperService.HEX_DIGITS.substring(Math.floor(Math.random() * 0x10), 1); // NOSONAR
        }

        // bits 12-15 of the time_hi_and_version field to 0010
        s[14] = '4';

        // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[19] = SdkUuidHelperService.HEX_DIGITS.substring((s[19] & 0x3) | 0x8, 1);

        s[8] = s[13] = s[18] = s[23] = '-';

        return s.join('');
    }

    public v4(): string {
        let rnds = this.random();

        // Per 4.4, set bits for version and clock_seq_hi_and_reserved
        rnds[6] = (rnds[6] & 0x0f) | 0x40;
        rnds[8] = (rnds[8] & 0x3f) | 0x80;

        return this.bytesToUuid(rnds);
    }

    public random(): Array<any> {
        let rnds = new Array(16);

        for (let i = 0, r = 0; i < 16; i++) {
            if ((i & 0x03) === 0) r = Math.random() * 0x100000000; // NOSONAR
            rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
        }

        return rnds;

    }

    private bytesToUuid(buf: Array<any>, i = 0) {
        let bth = this.initByteToHex();
        // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
        return ([bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]], '-',
        bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i++]],
        bth[buf[i++]], bth[buf[i++]]]).join('');
    }

    private initByteToHex() {
        var byteToHex = [];

        for (var i = 0; i < 256; ++i) {
            byteToHex[i] = (i + 0x100).toString(16).substring(1);
        }

        return byteToHex;
    }

}