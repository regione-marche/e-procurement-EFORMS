import { Injectable } from '@angular/core';
import { LottoItem } from '../models/app.model';

@Injectable({ providedIn: 'root' })
export class LotsTableService {
  
  // Indica se siamo nella visualizzazione a tabella per i lotti
  public lotsTableView: boolean = true;

  // Indice della prima riga visualizzata
  public first: number = 0;
  // Numero degli elementi da visualizzare in ogni pagina
  public rows: number = 25;

  // Array degli elementi dei lotti
  public lotsItems: Array<LottoItem> = [];

  constructor() {}
}
