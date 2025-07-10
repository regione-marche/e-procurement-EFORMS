import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { getUrlWithTimestamp } from '../sdk-helper/timestamp/sdk-timestamp-helper.service';

export function createTranslateLoader(http: HttpClient) {
    return new TranslateHttpLoader(http, './assets/i18n/', getUrlWithTimestamp('.json'));
}

