import { Injectable } from '@angular/core';
import { SdkContextEnum } from '../../sdk-shared/enums/sdk-context.enums';
import { SdkAbstractContextService } from '../abstract/sdk-abstract-context.service';
import { SdkSessionContextProvider } from './sdk-session-context.provider';

@Injectable({
  providedIn: 'root'
})
export class SdkSessionContextService extends SdkAbstractContextService {

  constructor() {
    super(new SdkSessionContextProvider(SdkContextEnum.Session));
  }

}
