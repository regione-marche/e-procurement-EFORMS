import { Injectable } from '@angular/core';
import { NgElement, WithProperties } from '@angular/elements';
import { each, isObject } from 'lodash-es';
import { of, Subject } from 'rxjs';

import { SdkMessagePanelComponent } from '../components/sdk-message-panel/sdk-message-panel.component';
import { SdkMessagePanelConfig, SdkMessagePanelTranslate } from '../sdk-message-panel.domain';

/**
 * Servizio per la creazione di pannelli di messaggistica
 */
@Injectable()
export class SdkMessagePanelService {

  /**
   * @ignore
   */
  constructor() { }

  /**
   * Metodo per mostrare un pannello di success
   * @param htmlElement Riferimento all'elemento HTML nel quale appendere il pannello
   * @param messages Lista di codici di messaggi da mostrare all'interno del pannello
   */
  public showSuccess(htmlElement: HTMLElement, messages: Array<SdkMessagePanelTranslate>, scrollView?: boolean): void {
    if (isObject(htmlElement)) {
      let componentConfig: SdkMessagePanelConfig = {
        messages,
        type: 'success',
        list: true
      };
      this.createComponent(htmlElement, componentConfig, true, scrollView);
    }
  }

  /**
   * Metodo per mostrare un pannello di info
   * @param htmlElement Riferimento all'elemento HTML nel quale appendere il pannello
   * @param messages Lista di codici di messaggi da mostrare all'interno del pannello
   */
  public showInfo(htmlElement: HTMLElement, messages: Array<SdkMessagePanelTranslate>, scrollView?: boolean): void {
    if (isObject(htmlElement)) {
      let componentConfig: SdkMessagePanelConfig = {
        messages,
        type: 'info',
        list: true
      };
      this.createComponent(htmlElement, componentConfig, true, scrollView);
    }
  }

  /**
   * Metodo per mostrare un pannello di warning
   * @param htmlElement Riferimento all'elemento HTML nel quale appendere il pannello
   * @param messages Lista di codici di messaggi da mostrare all'interno del pannello
   */
  public showWarning(htmlElement: HTMLElement, messages: Array<SdkMessagePanelTranslate>, scrollView?: boolean): void {
    if (isObject(htmlElement)) {
      let componentConfig: SdkMessagePanelConfig = {
        messages,
        type: 'warning',
        list: true
      };
      this.createComponent(htmlElement, componentConfig, true, scrollView);
    }
  }

  /**
   * Metodo per mostrare un pannello di error
   * @param htmlElement Riferimento all'elemento HTML nel quale appendere il pannello
   * @param messages Lista di codici di messaggi da mostrare all'interno del pannello
   */
  public showError(htmlElement: HTMLElement, messages: Array<SdkMessagePanelTranslate>, scrollView?: boolean): void {
    if (isObject(htmlElement)) {
      let componentConfig: SdkMessagePanelConfig = {
        messages,
        type: 'error',
        list: true
      };
      this.createComponent(htmlElement, componentConfig, true, scrollView);
    }
  }

  /**
   * Metodo per mostrare un pannello di info (infobox utilizzato come messaggio statico HTML nelle pagine)
   * @param htmlElement Riferimento all'elemento HTML nel quale appendere il pannello
   * @param message Lista di codici di messaggi da mostrare all'interno del pannello
   */
  public showInfoBox(htmlElement: HTMLElement, message: SdkMessagePanelTranslate): void {
    if (isObject(htmlElement)) {
      let componentConfig: SdkMessagePanelConfig = {
        messages: [
          message
        ],
        type: 'info',
        list: false
      };
      this.createComponent(htmlElement, componentConfig, true);
    }
  }

  /**
   * Metodo per mostrare una lista di pannello
   * @param htmlElement Riferimento all'elemento HTML nel quale appendere il pannello
   * @param messages Lista di messaggi da mostrare all'interno dei pannelli
   */
  public show(htmlElement: HTMLElement, messages: Array<SdkMessagePanelConfig>): void {
    this.removeChildren(htmlElement);
    each(messages, (one: SdkMessagePanelConfig) => {
      this.createComponent(htmlElement, one, false);
    });
  }

  /**
   * Metodo per appendere ulteriori messaggi al message panel esistente
   * @param htmlElement Riferimento all'elemento HTML nel quale appendere il pannello
   * @param messages Lista di messaggi da mostrare all'interno dei pannelli
   */
  public append(htmlElement: HTMLElement, messages: Array<SdkMessagePanelTranslate>): void {
    if (htmlElement != null) {
      let component = htmlElement.firstElementChild as NgElement & WithProperties<SdkMessagePanelComponent>;
      if (component != null && component.appendMessagesSubject$ != null) {
        component.appendMessagesSubject$.next(messages);
      }
    }
  }

  /**
   * Metodo per rimuovere tutti i messaggi
   * @param htmlElement Riferimento all'elemento HTML dal quale rimuovere tutti i messaggi
   */
  public clear(htmlElement: HTMLElement): void {
    if (isObject(htmlElement)) {
      this.removeChildren(htmlElement);
    }
  }

  /**
   * @ignore
   */
  private createComponent(htmlElement: HTMLElement, componentConfig: SdkMessagePanelConfig, removeOld: boolean, scrollView: boolean = true): void {
    if (isObject(htmlElement)) {
      if (removeOld === true) {
        this.removeChildren(htmlElement);
      }

      let selector: string = 'sdk-message-panel';
      if (selector) {
        let component = document.createElement(selector) as NgElement & WithProperties<SdkMessagePanelComponent>;
        component.config$ = of(componentConfig);
        component.appendMessagesSubject$ = new Subject();
        htmlElement.appendChild(component);
        if (scrollView) {
          this.scrollToMessagePanel(htmlElement);
        }
      }
    }
  }

  /**
   * @ignore
   */
  private scrollToMessagePanel(messagesPanel: HTMLElement): void {
    // let ofTop: number = messagesPanel.offsetTop > 100 ? messagesPanel.offsetTop : 100;
    // window.scrollTo({
    //   top: ofTop - 100,
    //   left: 0,
    //   behavior: 'auto'
    // });
    messagesPanel.scrollIntoView();
  }

  /**
   * @ignore
   */
  private removeChildren(htmlElement: HTMLElement): void {
    // rimuovo i componenti attualmente renderizzati all'interno del container
    while (htmlElement.firstChild) {
      htmlElement.removeChild(htmlElement.firstChild);
    }
  }
}
