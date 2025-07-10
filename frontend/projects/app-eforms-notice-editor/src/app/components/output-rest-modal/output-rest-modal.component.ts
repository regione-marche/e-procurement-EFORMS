import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import {
  SdkBasicButtonInput,
  SdkButtonGroupInput
} from '@maggioli/sdk-controls';
import { BehaviorSubject } from 'rxjs';
import { OutputRestModalConfig } from '../../models/app.model';

@Component({
  templateUrl: './output-rest-modal.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutputRestModalComponent
  extends SdkAbstractComponent<OutputRestModalConfig, void, any>
  implements OnInit, AfterViewInit, OnDestroy
{
  // #region Variables

  @ViewChild('messages') _messagesPanel: ElementRef;

  private _buttons: SdkButtonGroupInput;

  // Pulsantiera
  public buttonsSubj: BehaviorSubject<SdkButtonGroupInput>;

  public config: OutputRestModalConfig;

  public downloadButton: SdkBasicButtonInput;

  // #endregion

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #region Hooks

  protected onInit(): void {
    this.loadButtons();
  }

  protected onAfterViewInit(): void {}

  protected onDestroy(): void {}

  protected onOutput(_data: void): void {}

  protected onConfig(config: OutputRestModalConfig): void {
    if (config != null) {
      this.config = { ...config };
      this.loadButtons();
      this.isReady = true;
    }
  }

  protected onData(_data: void): void {}

  /**
   * @ignore
   */
  protected onUpdateState(_state: boolean): void {}

  // #endregion

  private chooseButton(): SdkBasicButtonInput {
    switch (this.config.type) {
      case 'JSON':
        const downloadButtonJSON: SdkBasicButtonInput = {
          code: 'download-json',
          label: 'BUTTONS.DOWNLOAD-JSON',
          icon: 'mgg-icons-action-download'
        };
        return downloadButtonJSON;
      case 'XML':
        const downloadButtonXML: SdkBasicButtonInput = {
          code: 'download-xml',
          label: 'BUTTONS.DOWNLOAD-XML',
          icon: 'mgg-icons-action-download'
        };
        return downloadButtonXML;
      default:
        return null;
    }
  }

  private loadButtons(): void {
    this.downloadButton = this.chooseButton();
    if (this.downloadButton) {
      this._buttons = {
        buttons: [this.downloadButton]
      };
      this.buttonsSubj = new BehaviorSubject(this._buttons);
    }
  }

  public onButtonClick(event: any): void {
    const eventCode = event.code;

    switch (eventCode) {
      case 'download-json':
        this.handleDownload('Appalti&Contratti_M-Eforms', 'json');
        break;
      case 'download-xml':
        this.handleDownload('Appalti&Contratti_M-Eforms', 'xml');
        break;
      default:
        console.log(`Unhandled button action: ${eventCode}`);
    }
  }

  private handleDownload(fileName: string, fileExtension: string): void {
    const data = this.config.content;
    const blob = new Blob([data], { type: 'application/' + fileExtension });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName + '.' + fileExtension;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // #region Private

  private get messagesPanel(): HTMLElement {
    return this._messagesPanel?.nativeElement ?? undefined;
  }

  // #endregion
}
