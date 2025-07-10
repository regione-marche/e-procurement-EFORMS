import { Pipe, PipeTransform } from '@angular/core';

import { SdkNumberFormatService } from '../service/sdk-number-format.service';

@Pipe({
  name: 'sdkNumberFormat'
})
export class SdkNumberFormatPipe implements PipeTransform {

  constructor(private sdkNumberFormatService: SdkNumberFormatService) { }

  public transform(value: any, localeId: string): any {
    return this.sdkNumberFormatService.formatNumber(value, localeId);
  }

}
