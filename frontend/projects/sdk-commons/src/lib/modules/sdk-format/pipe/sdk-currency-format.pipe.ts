import { Pipe, PipeTransform } from '@angular/core';

import { SdkNumberFormatService } from '../service/sdk-number-format.service';

@Pipe({
  name: 'sdkCurrencyFormat'
})
export class SdkCurrencyFormatPipe implements PipeTransform {

  constructor(private sdkNumberFormatService: SdkNumberFormatService) { }

  public transform(value: any, locale: string, currency: string): string {
    return this.sdkNumberFormatService.formatCurrencyString(value, locale, currency);
  }

}
