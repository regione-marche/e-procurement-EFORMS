import { Injectable, Injector } from '@angular/core';

import { SdkBaseService } from '../../sdk-base/sdk-base.service';
import { IBrowserInfo } from '../../sdk-shared/types/sdk-common.types';

@Injectable({ providedIn: 'root' })
export class SdkBrowserHelperService extends SdkBaseService {

    constructor(inj: Injector) {
        super(inj);
    }

    public getBrowserInfo(): IBrowserInfo {

        let obj: IBrowserInfo = {
            browserName: this.getBrowserName(),
            navigatorAppName: window.navigator.appName, // deprecata, torna sempre Netscape
            navigatorUserAgent: window.navigator.userAgent,
            fullVersion: '' + parseFloat(this.detectBrowserVersion()),
            majorVersion: '' + parseInt(this.detectBrowserVersion(), 10)
        };

        return obj;
    }

    private getBrowserName(): string {
        const agent = window.navigator.userAgent.toLowerCase();

        let browser = null;

        if (agent.indexOf('edge') > -1) {
            browser = 'Microsoft Edge';
        } else if (agent.indexOf('edg') > -1) {
            browser = 'Chromium-based Edge';
        } else if (agent.indexOf('opr') > -1) {
            browser = 'Opera';
        } else if (agent.indexOf('chrome') > -1 || agent.indexOf('crios') > -1) {
            browser = 'Chrome';
        } else if (agent.indexOf('trident') > -1) {
            browser = 'Internet Explorer';
        } else if (agent.indexOf('firefox') > -1) {
            browser = 'Firefox';
        } else if (agent.indexOf('safari') > -1) {
            browser = 'Safari';
        } else {
            browser = 'other';
        }

        return browser;
    }

    private detectBrowserVersion(): string {
        var userAgent = navigator.userAgent, tem,
            matchTest = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

        if (/trident/i.test(matchTest[1])) {
            tem = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            return 'IE ' + (tem[1] || '');
        }
        if (matchTest[1] === 'Chrome') {
            tem = userAgent.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        matchTest = matchTest[2] ? [matchTest[1], matchTest[2]] : [navigator.appName, navigator.appVersion, '-?'];
        if ((tem = userAgent.match(/version\/(\d+)/i)) != null) matchTest.splice(1, 1, tem[1]);
        // return matchTest.join(' ');
        return matchTest[1];
    }
}