import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { isObject, isUndefined } from 'lodash-es';
import { Subject } from 'rxjs';

import { SdkMessagePanelConfig, SdkMessagePanelTranslate } from '../../sdk-message-panel.domain';

/**
 * Componente che renderizza un pannello di messaggistica
 */
@Component({
  selector: 'sdk-message-panel',
  templateUrl: './sdk-message-panel.component.html',
  styleUrls: ['./sdk-message-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkMessagePanelComponent extends SdkAbstractComponent<SdkMessagePanelConfig, void, void> implements OnInit, OnDestroy, AfterViewInit {

  /**
   * @ignore
   */
  @Input('appendMessage') public appendMessagesSubject$: Subject<Array<SdkMessagePanelTranslate>>;

  /**
   * @ignore
   */
  @ViewChild('messagePanel') public _messagePanel: ElementRef;

  /**
   * @ignore
   */
  public config: SdkMessagePanelConfig;

  /**
   * @ignore
   */
  public panelClass: string;

  /**
   * @ignore
   */
  public messageHtml: string;

  /**
   * @ignore
   */
  constructor(inj: Injector, private cdr: ChangeDetectorRef) { super(inj, cdr) }

  /**
   * @ignore
   */
  protected onInit(): void { }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void {
    this.addSubscription(this.appendMessagesSubject$.subscribe((messages: Array<SdkMessagePanelTranslate>) => {
      if (this.config.list) {
        this.config.messages = [
          ...this.config.messages,
          ...messages
        ];
        this.cdr.markForCheck();
      }
    }));
    this.messagePanel.focus();
  }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onOutput(_data: void): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkMessagePanelConfig): void {
    this.config = config;
    if (isObject(this.config)) {
      this.panelClass = this.config.type + '-message';
      if (isUndefined(this.config.list)) {
        this.config.list = true;
      }
      if (this.config.list !== true) {
        this.messageHtml = this.translateService.instant(this.config.messages[0].message, this.config.messages[0].messageParams);
      }
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(_data: void): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #region Getters

  private get translateService(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

  // #region Private

  private get messagePanel(): HTMLElement {
    return this._messagePanel ? this._messagePanel.nativeElement : undefined;
  }

  // #endregion

}
