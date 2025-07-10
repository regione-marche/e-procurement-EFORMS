import { SdkAbstractDictionaryProvider } from '../sdk-shared/dictionary/sdk-abstract-dictionary.provider';
import { ISdkDictionaryProvider } from '../sdk-shared/types/sdk-common.types';

export class SdkCacheProvider extends SdkAbstractDictionaryProvider implements ISdkDictionaryProvider {

    constructor() { super(); }

    protected prefix(): string { return 'CACHE' }

}