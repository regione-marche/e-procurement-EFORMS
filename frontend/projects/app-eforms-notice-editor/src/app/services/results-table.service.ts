import { Injectable } from '@angular/core';
import { AppaltoItem, OffertaItem, ParteOfferenteItem, RisultatoDelLottoItem } from '../models/app.model';

@Injectable({ providedIn: 'root' })
export class ResultsTableService {
  
  // Indica se siamo nella visualizzazione a tabella per i risultati
  public resultsTableView: boolean = true;

  // Parti offerenti
  public firstPartiOfferenti: number = 0; // indice della prima riga visualizzata
  public rowsPartiOfferenti: number = 25; // numero degli elementi da visualizzare in ogni pagina
  public partiOfferentiItems: Array<ParteOfferenteItem> = []; // Array degli elementi delle parti offerenti

  // Appalti
  public firstAppalti: number = 0; // indice della prima riga visualizzata
  public rowsAppalti: number = 25; // numero degli elementi da visualizzare in ogni pagina
  public appaltiItems: Array<AppaltoItem> = []; // Array degli elementi degli appalti

  // Offerte
  public firstOfferte: number = 0; // indice della prima riga visualizzata
  public rowsOfferte: number = 25; // numero degli elementi da visualizzare in ogni pagina
  public offerteItems: Array<OffertaItem> = []; // Array degli elementi delle offerte

  // Risultati dei lotti
  public firstRisultatiDeiLotti: number = 0; // indice della prima riga visualizzata
  public rowsRisultatiDeiLotti: number = 25; // numero degli elementi da visualizzare in ogni pagina
  public risultatiDeiLottiItems: Array<RisultatoDelLottoItem> = []; // Array degli elementi dei risultati dei lotti

  constructor() {}
}
