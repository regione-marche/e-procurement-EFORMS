import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IDictionary } from '@maggioli/sdk-commons';
import { AccordionOutput, NoticeInfo } from '../models/app.model';

@Injectable({ providedIn: 'root' })
export class FormDataService {
  // Contenuto form sdk indicizzato per elementi di primo livello
  public _formContentBackup: IDictionary<any> = {};
  // Contenuto form reactive indicizzato per elementi di primo livello
  public _formReactiveContentBackup: IDictionary<FormGroup | IDictionary<FormGroup>> = {};
  // Contenuto form reactive indicizzato per elementi di primo livello originale (non modificato dall'utente)
  public _formReactiveContentOriginalBackup: IDictionary<FormGroup | IDictionary<FormGroup>> = {};
  // Id Scheme della form selezionata se l'elemento di primo livello e' ripetibile
  public _currentSelectedIdBackup: string;
  // Id Scheme della form selezionata se l'elemento di primo livello e' ripetibile
  public _currentSelectedLabelIdBackup: string;
  // Elemento form reactive parziale (di primo livello) selezionato e renderizzato nella form
  public _formGroupBackup: FormGroup;
  // Elemento form reactive metadata selezionato e renderizzato nella form
  public _metadataFormGroupBackup: FormGroup;
  // Indice della form selezionata se l'elemento di primo livello e' ripetibile
  public _currentGroupIndexBackup: number;

  public _resultsInnerKey: string;

  public noticeInfo: NoticeInfo;
  public accordionOutput: AccordionOutput | null;

  public changed: boolean = false;

  constructor() {}
}
