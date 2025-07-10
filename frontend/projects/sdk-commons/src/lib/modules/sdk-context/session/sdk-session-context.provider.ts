import { SdkAbstractDictionaryProvider } from '../../sdk-shared/dictionary/sdk-abstract-dictionary.provider';
import { SdkContextEnum } from '../../sdk-shared/enums/sdk-context.enums';
import { ISdkDictionaryProvider } from '../../sdk-shared/types/sdk-common.types';

export class SdkSessionContextProvider extends SdkAbstractDictionaryProvider implements ISdkDictionaryProvider {

  constructor(private name: string) { super(); }

  protected prefix(): string {
    return `${SdkContextEnum.Prefix}_${this.name}`;
  }

}
