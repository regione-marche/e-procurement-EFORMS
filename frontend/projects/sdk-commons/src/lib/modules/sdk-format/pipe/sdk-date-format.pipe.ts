import { Pipe, PipeTransform } from '@angular/core';

import { SdkDateHelper } from '../../sdk-helper/date/sdk-date-helper.service';

@Pipe({
  name: 'sdkDateFormat'
})
export class SdkDateFormatPipe implements PipeTransform {

  constructor(private sdkDateHelper: SdkDateHelper) { }

  public transform(value: any, format: string, locale?: string): string {
    return this.sdkDateHelper.format(value, format, locale);
  }

}
