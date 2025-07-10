import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {
  SdkAbstractComponent,
  SdkHttpLoaderService,
  SdkHttpLoaderType,
  SdkSessionStorageService
} from '@maggioli/sdk-commons';
import { SdkBasicButtonInput, SdkButtonGroupInput, SdkMessagePanelService } from '@maggioli/sdk-controls';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, map, mergeMap } from 'rxjs';
import { Constants } from '../../app.constants';
import { CvsItemDTO, IAppaltiBaseResponse, IAppaltiPersistenceRequest } from '../../models/api.model';
import { AccordionOutput, OutputCvsValidationModalConfig } from '../../models/app.model';
import { ExternalIntegrationService } from '../../services/external-integration.service';
import { FormService } from '../../services/form.service';
import { ScrollService } from '../../services/formcontrol-scroll.service';

@Component({
  templateUrl: './output-cvs-validation-modal.component.html',
  styleUrl: './output-cvs-validation-modal.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OutputCvsValidationModalComponent
  extends SdkAbstractComponent<OutputCvsValidationModalConfig, void, any>
  implements OnInit, AfterViewInit, OnDestroy
{
  // #region Variables
  @ViewChild('messages') _messagesPanel: ElementRef;

  public config: OutputCvsValidationModalConfig;
  public showDetails: boolean = false;
  public cvsItems: Array<CvsItemDTO> = []; // righe della tabella da visualizzare

  // Pulsantiera
  private _buttons: SdkButtonGroupInput;
  public buttonsSubj: BehaviorSubject<SdkButtonGroupInput> = new BehaviorSubject(null);
  private detailsButton: SdkBasicButtonInput;
  private downloadButton: SdkBasicButtonInput;
  private closeButton: SdkBasicButtonInput;
  private _scrollService: ScrollService = inject(ScrollService);
  // private _alreadySent: boolean = false;

  private backofficeIntegration: boolean = true;
  private roleMapping: Record<string, string> = {
    ERROR: 'Errore',
    WARN: 'Avviso',
    INFO: 'Informazione'
  };

  private _sdkMessagePanelService: SdkMessagePanelService = inject(SdkMessagePanelService);
  private _formService: FormService = inject(FormService);
  private translateService: TranslateService = inject(TranslateService);
  private _sdkSessionStorageService: SdkSessionStorageService = inject(SdkSessionStorageService);
  private _externalIntegrationService: ExternalIntegrationService = inject(ExternalIntegrationService);
  private _sdkHttpLoaderService: SdkHttpLoaderService = inject(SdkHttpLoaderService);

  // #endregion

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #region Hooks

  protected onInit(): void {
    // check if backoffice integration
    this.checkExternalIntegration();
    this.loadButtons();
    this.loadCvsItems();
  }

  protected onAfterViewInit(): void {}

  protected onDestroy(): void {}

  protected onOutput(_data: void): void {}

  protected onConfig(config: OutputCvsValidationModalConfig): void {
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

  // #region Private

  private get messagesPanel(): HTMLElement {
    return this._messagesPanel?.nativeElement ?? undefined;
  }

  goToError(formControlCustomId: string, finalTarget: AccordionOutput): void {
    //carico la pagina corretta
    this._scrollService.triggerNavigation(finalTarget);

    //vado al formControl giusto
    this.waitForSignalToComplete(formControlCustomId);
  }

  async waitForSignalToComplete(formControlCustomId): Promise<void> {
    while (this._scrollService.clickFirstLevelItem?.().navigate === true) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    //chiudo il modale
    let close: any = {};
    close.code = 'close-button';
    this.onButtonClick(close);

    await new Promise((resolve) => setTimeout(resolve, 200));
    this._scrollService.scrollToControl(formControlCustomId);
  }

  // Metodo che carica gli elementi da visualizzare in base alla visualizzazione con o senza dettagli
  private loadCvsItems(): void {
    if (this.showDetails) {
      this.cvsItems = this.config?.content?.cvsResult?.items;
    } else {
      // Se non ci sono errori di validazione CVS mostra una sola riga di "OK"
      if (this.config?.content?.cvsResult?.totalFailedAsserts == 0) {
        const okItem: CvsItemDTO = {
          index: 'OK',
          id: null,
          location: '*',
          numeroLotto: null,
          test: null,
          role: 'Info',
          text: this.translateService.instant('CVS-VALIDATION-RESULT.VALIDAZIONE-OK'),
          legenda: null
        };
        this.cvsItems = [okItem];
      } else {
        // Altrimenti, recupera solamente i failed asserts da mostrare in tabella
        this.cvsItems = this.config?.content?.cvsResult?.items.filter((item) => {
          return item.index.includes('KO');
        });
      }
    }
  }

  private loadButtons(): void {
    // Crea pulsante "Mostra/nascondi dettagli"
    this.detailsButton = {
      code: 'details-button',
      label: 'BUTTONS.MOSTRA-DETTAGLI',
      icon: 'mgg-icons-view-side-by-side'
    };

    // Crea pulsante "Conferma, crea XML e chiudi" e "Scarica XML eForms"
    if (this.backofficeIntegration) {
      this.downloadButton = {
        code: 'confirm-create-xml-close',
        label: 'BUTTONS.CONFERMA-CREA-XML',
        icon: 'mgg-icons-construction',
        disabled: this.config?.content?.cvsResult?.totalFailedAsserts > 0
        //this._alreadySent // disabilitato se ci sono errori di validazione CVS
      };
    } else {
      this.downloadButton = {
        code: 'download-xml-eforms',
        label: 'BUTTONS.DOWNLOAD-XML-EFORMS',
        icon: 'mgg-icons-action-download',
        disabled: this.config?.content?.cvsResult?.totalFailedAsserts > 0 // disabilitato se ci sono errori di validazione CVS
      };
    }

    // Crea pulsante "Chiudi"
    this.closeButton = {
      code: 'close-button',
      label: 'BUTTONS.CLOSE',
      icon: 'mgg-icons-action-close'
    };

    this._buttons = {
      buttons: [this.detailsButton, this.downloadButton, this.closeButton]
    };
    this.buttonsSubj.next(this._buttons);
  }

  private checkExternalIntegration(): void {
    let hasDataGetUrl: boolean = this._sdkSessionStorageService.getItem(Constants.EXTERNAL_DATA_GET_INVOKING_URL);
    let hasKeepAliveUrl: boolean = this._sdkSessionStorageService.getItem(Constants.EXTERNAL_KEEP_ALIVE_INVOKING_URL);
    let hasPersistenceUrl: boolean = !!this._sdkSessionStorageService.getItem(
      Constants.EXTERNAL_PERSISTENCE_INVOKING_URL
    );

    this.backofficeIntegration = hasDataGetUrl && hasKeepAliveUrl && hasPersistenceUrl;
  }

  // #endregion

  // #region Public

  public onButtonClick(event: any): void {
    const eventCode = event.code;

    switch (eventCode) {
      case 'details-button':
        this.showDetails = !this.showDetails;
        this._buttons.buttons.find((btn) => btn.code == 'details-button').label = this.showDetails
          ? 'BUTTONS.NASCONDI-DETTAGLI'
          : 'BUTTONS.MOSTRA-DETTAGLI'; // cambia label al pulsante
        this.loadCvsItems(); // cambia le righe in tabella
        break;
      case 'confirm-create-xml-close':
        this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
        const xml: string = this.config?.content?.cvsResult?.xml;
        let visualModel: string = JSON.stringify(this.config.content?.visualModel);

        let request: IAppaltiPersistenceRequest = {
          tipoTracciato: 'BOZZA',
          tracciato: visualModel
        };

        this._externalIntegrationService
          .persistence(request)
          .pipe(
            map((result: IAppaltiBaseResponse) => {
              if (!result.success) {
                this.logger.error('Errore salvataggio bozza', result.errorMessagge);
                throw new Error('Errore salvataggio bozza');
              }
              this.logger.debug('save bozza done!');
              return result;
            }),
            mergeMap(() => {
              request = {
                tipoTracciato: 'XML',
                tracciato: xml
              };
              return this._externalIntegrationService.persistence(request);
            }),
            map((result: IAppaltiBaseResponse) => {
              if (!result.success) {
                this.logger.error('Errore salvataggio xml', result.errorMessagge);
                throw new Error('Errore salvataggio xml');
              }
              this.logger.debug('save xml done!');
              return result;
            })
          )
          .subscribe({
            next: () => {
              this._sdkHttpLoaderService.hideLoader();
              //this._alreadySent = true;
              this.loadButtons();
              this.logger.info('Salvataggio bozza/xml avvenuto con successo!');
              this._sdkMessagePanelService.showSuccess(this.messagesPanel, [
                {
                  message: 'BOZZA-JSON-XML.SAVE-XML-SUCCESS'
                }
              ]);
            },
            error: (err) => {
              this._sdkHttpLoaderService.hideLoader();
              this.logger.error('Errore salvataggio bozza/xml', err);
              this._sdkMessagePanelService.showSuccess(this.messagesPanel, [
                {
                  message: 'BOZZA-JSON-XML.SAVE-XML-FAILURE'
                }
              ]);
            }
          });
        break;
      case 'download-xml-eforms':
        this.handleDownloadXmlEforms('Appalti&Contratti_M-eForms', 'xml');
        break;
      case 'close-button':
        this.markForCheck(() => {
          let body: HTMLElement = document.body;
          if (body != null && body.classList.contains('modal-open') === true) {
            body.classList.remove('modal-open');
          }
        });
        this.emitOutput({ close: true });
        break;
      default:
        console.log(`Unhandled button action: ${eventCode}`);
    }
  }

  private handleDownloadXmlEforms(fileName: string, fileExtension: string): void {
    const data = this.config?.content?.cvsResult?.xml;
    const blob = new Blob([data], { type: 'application/' + fileExtension });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName + '.' + fileExtension;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Effettua un mapping per visualizzare in italiano il campo "role"
  public mapRoleString(role: string): string {
    if (role) {
      return this.roleMapping[role.toUpperCase()] || '';
    }
    return '';
  }

  /**
   * Unisce le liste di Lotti e Gruppi di Lotti (se esistenti) e ritorna la label corrispondente tramite indice della validazione CVS
   * numeroLotto parte da 0 se popolato, es.:
   * 0 --> 0001 (lotto)
   * 1 --> 0002 (lotto)
   * 2 --> 0003 (lotto)
   * 3 --> 0001 (gruppo di lotti)
   * 4 --> 0002 (gruppo di lotti)
   */
  public recuperaIdentificativoLotto(numeroLotto: number): string {
    if (numeroLotto != null) {
      let labels: string[] = [];

      if (this._formService.firstLevelItems) {
        this._formService.firstLevelItems.forEach((item) => {
          // aggiungi Lotti
          if (item.id == 'GR-Lot') {
            item.items.forEach((lotto) => {
              labels.push(lotto.label);
            });
          }
          // aggiungi Gruppi di Lotti
          if (item.id == 'GR-LotsGroup') {
            item.items.forEach((groupLot) => {
              labels.push(groupLot.label);
            });
          }
        });
      }

      return labels[numeroLotto];
    }

    return '-';
  }

  // #endregion
}
