import { Injectable, Injector } from '@angular/core';
import { SdkBaseService } from '@maggioli/sdk-commons';
import { IndividualConfig, Toast, ToastrService } from 'ngx-toastr';

import { merge } from 'lodash-es';
import { SdkNotificationConfig } from '../sdk-notification.domain';

/**
 * Servizio per mostrare una notifica
 */
@Injectable()
export class SdkNotificationService extends SdkBaseService {

  /**
   * @ignore
   */
  private defaultOptions: IndividualConfig = {
    closeButton: true,
    disableTimeOut: true,
    easeTime: 300,
    easing: 'ease-in',
    enableHtml: true,
    extendedTimeOut: 0,
    messageClass: 'toast-message',
    onActivateTick: false,
    positionClass: 'toast-top-right',
    progressBar: false,
    toastClass: 'ngx-toastr',
    titleClass: 'toast-title',
    tapToDismiss: true,
    timeOut: 0,
    toastComponent: Toast,
    progressAnimation: 'increasing',
    newestOnTop: true,
    payload: null
  };

  /**
   * @ignore
   */
  constructor(inj: Injector, private toastrService: ToastrService) { super(inj) }

  /**
   * Metodo per mostrare una notifica
   * @param config Configurazione della notifica
   * @param options Opzioni custom della notifica
   */
  public show(config: SdkNotificationConfig, options?: IndividualConfig): void {
    if (config.severity === 'error') {
      this.toastrService.error(config.content, config.title, merge(this.defaultOptions, options));
    } else if (config.severity === 'warning') {
      this.toastrService.warning(config.content, config.title, merge(this.defaultOptions, options));
    } else if (config.severity === 'info') {
      this.toastrService.info(config.content, config.title, merge(this.defaultOptions, options));
    } else if (config.severity === 'success') {
      this.toastrService.success(config.content, config.title, merge(this.defaultOptions, options));
    }
  }

  /**
   * Metodo per mostrare una notifica di successo
   * @param message Messaggio della notifica
   */
  public showSuccess(message: string): void {
    this.toastrService.success(message, '', this.defaultOptions);
  }


  /**
   * Metodo per mostrare una notifica di errore di una chiamata HTTP
   * @param message Messaggio della notifica
   */
  public showHttpError(message: string): void {
    let options: IndividualConfig = {
      ...this.defaultOptions,
      positionClass: 'toast-bottom-center',
    }
    this.toastrService.error(message, '', options);
  }

  /**
   * Metodo per mostrare una notifica di errore
   * @param message Messaggio della notifica
   */
  public showError(message: string): void {
    this.toastrService.error(message, '', this.defaultOptions);
  }

  /**
   * Metodo per mostrare una notifica di warning
   * @param message Messaggio della notifica
   */
  public showWarning(message: string): void {
    this.toastrService.warning(message, '', this.defaultOptions);
  }

  /**
   * Metodo per rimuovere tutte le notifiche
   */
  public clearAll(): void {
    this.toastrService.clear();
  }

  // #region Getters

  // private get toastrService(): ToastrService { return this.injectable(ToastrService) }

  // #endregion
}
