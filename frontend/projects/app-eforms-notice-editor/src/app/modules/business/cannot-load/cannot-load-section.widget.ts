import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { IDictionary, SdkBusinessAbstractWidget } from '@maggioli/sdk-commons';
import { SdkMessagePanelService } from '@maggioli/sdk-controls';

@Component({
  templateUrl: `cannot-load-section.widget.html`,
  encapsulation: ViewEncapsulation.None
})
export class CannotLoadSectionWidget extends SdkBusinessAbstractWidget<void> implements OnInit, OnDestroy {
  @HostBinding('class') classNames = `cannot-load-section`;

  @ViewChild('messages') _messagesPanel: ElementRef;

  public config: IDictionary<any>;

  private _sdkMessagePanelService: SdkMessagePanelService = inject(SdkMessagePanelService);

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #region Hooks

  protected onInit(): void {}

  protected onAfterViewInit(): void {
    this._sdkMessagePanelService.showWarning(
      this.messagesPanel,
      [
        {
          message: 'CANNOT-LOAD-APP'
        }
      ],
      false
    );
  }

  protected onDestroy(): void {}

  protected onConfig(config: any): void {
    this.config = config;
  }

  protected onUpdateState(_state: boolean): void {}

  // #endregion

  // #region Private

  private get messagesPanel(): HTMLElement {
    return this._messagesPanel != null ? this._messagesPanel.nativeElement : undefined;
  }

  // #endregion
}
