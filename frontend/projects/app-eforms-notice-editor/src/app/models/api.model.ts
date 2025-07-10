import { IDictionary } from '@maggioli/sdk-commons';
import { IVisualModelElement } from './app.model';

export interface ResponseResult<T> {
  done: boolean;
  messages?: Array<string>;
  data?: T;
}

export interface HomePageInfoDTO {
  appVersion?: string;
  sdkVersions?: Array<string>;
}

export interface XMLOutput {
  xml?: string;
}

export interface SdkVersion {
  snapshot?: boolean;
  patch?: string;
  minor?: string;
  major?: string;
  nextMinor?: string;
  nextMajor?: string;
  preRelease?: boolean;
}

export interface NoticeSubtypesDetailDTO {
  sdkVersion?: SdkVersion;
  noticeSubTypes?: Array<IDictionary<any>>;
}

export interface NoticeTypesDTO {
  sdkVersion?: SdkVersion;
  noticeTypes?: Array<string>;
}

export interface INoticeTypeItemNode extends IDictionary<any> {
  id: string;
  contentType: 'group' | 'field';
  _label: string;
  nodeId?: string;
  content?: Array<INoticeTypeItemNode>;
}

export interface CvsModalData {
  cvsResult: CvsOutputDTO;
  visualModel?: IVisualModelElement;
}

export interface CvsOutputDTO {
  totalFiredRules: number;
  totalFailedAsserts: number;
  items: Array<CvsItemDTO>;
  xml?: string;
}

export interface CvsItemDTO {
  index: string;
  id: string;
  location: string;
  numeroLotto: number;
  test: string;
  role: string;
  text: string;
  legenda: string;
}

/**
 * Interfaccia di base per le chiamate di integrazione con Appalti
 */
export interface IAppaltiBaseResponse {
  success: boolean;
  errorMessagge?: string;
}

/**
 * Interfaccia di risposta della chiamata di inizializzazione
 */
export interface IAppaltiLoadInitialData extends IAppaltiBaseResponse {
  tipoTracciato: TAppaltiTracciatoInitType;
  // String se mi arriva una bozza, IDictionary<any> se mi arriva una inizializzazione
  tracciato: IDictionary<any> | string;
  newToken: string;
}

/**
 * Tipologia di tracciato della chiamta di inizializzazione
 */
export type TAppaltiTracciatoInitType = 'INIZIALIZZAZIONE' | 'BOZZA' | 'INIZIALIZZAZIONE_RETTIFICA' | 'BOZZA_RETTIFICA';

/**
 * Tipologia di tracciato della chiamta di persistenza
 */
export type TAppaltiTracciatoPersistenceType = 'BOZZA' | 'XML';

/**
 * Oggetto di risposta del keep alive
 */
export interface IAppaltiKeepAlive extends IAppaltiBaseResponse {
  newToken: string;
}

/**
 * Oggetto di richiesta del persistence
 */
export interface IAppaltiPersistenceRequest {
  tipoTracciato: TAppaltiTracciatoPersistenceType;
  tracciato: string;
}
