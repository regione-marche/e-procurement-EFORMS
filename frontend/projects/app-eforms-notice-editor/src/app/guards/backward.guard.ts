import { Injectable, Injector } from '@angular/core';
import { SdkBaseService, SdkUpdateService } from '@maggioli/sdk-commons';

@Injectable({ providedIn: 'root' })
export class BackwardGuard extends SdkBaseService {
  private updateState: boolean;

  constructor(inj: Injector) {
    super(inj);
    this.getUpdateState();
  }

  public canDeactivate(): any {
    return this.updateState === false;
  }

  private getUpdateState(): void {
    this.sdkUpdateService.on((state: boolean) => {
      this.updateState = state;
    });
  }

  // #region Getters

  private get sdkUpdateService(): SdkUpdateService {
    return this.injectable(SdkUpdateService);
  }

  // #endregion
}
