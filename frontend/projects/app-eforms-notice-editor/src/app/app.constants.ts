import { InjectionToken } from '@angular/core';

export const Constants = {
  APP_NAME: 'app-eforms-notice-editor',
  TOKEN_SESSION_KEY: 'AUTHH',
  TRACCIATO_SESSION_KEY: 'TRACCIATO',
  EXTERNAL_DATA_GET_INVOKING_URL: 'EXTERNAL_DATA_GET_INVOKING_URL',
  EXTERNAL_KEEP_ALIVE_INVOKING_URL: 'EXTERNAL_KEEP_ALIVE_INVOKING_URL',
  EXTERNAL_PERSISTENCE_INVOKING_URL: 'EXTERNAL_PERSISTENCE_INVOKING_URL',

  ContentType: {
    FIELD: 'field',
    GROUP: 'group',
    DATA_CONTAINER: 'notice-data',
    METADATA_CONTAINER: 'notice-metadata',
    ROOT: 'notice'
  },

  DisplayType: {
    COMBOBOX: 'COMBOBOX',
    CHECKBOX: 'CHECKBOX',
    GROUP: 'GROUP',
    TEXTAREA: 'TEXTAREA',
    TEXTBOX: 'TEXTBOX',
    RADIO: 'RADIO'
  },

  Attributes: {
    CONTENT_ID_ATTRIBUTE: 'data-content-id',
    CONTENT_TYPE_ATTRIBUTE: 'data-content-type', // For the VIS TYPE
    NODE_ID_ATTRIBUTE: 'data-node-id',
    ID_SCHEME_ATTRIBUTE: 'data-id-scheme',
    ID_SCHEMES_ATTRIBUTE: 'data-id-schemes',
    VALUE_SOURCE_ATTRIBUTE: 'data-value-source',
    COUNTER_ATTRIBUTE: 'data-counter'
  },

  VIS_CONTENT_COUNT: 'contentCount',
  VIS_VALUE: 'value',
  VIS_TYPE: 'visType', // Has nothing to do with HTML element type!
  VIS_TYPE_FIELD: 'field',
  VIS_TYPE_NON_FIELD: 'non-field',

  StandardIdentifiers: {
    ND_ROOT: 'ND-Root',
    SDK_VERSION_FIELD: 'OPT-002-notice',
    UBL_VERSION_FIELD: 'OPT-001-notice',
    NOTICE_SUBTYPE_FIELD: 'OPP-070-notice',
    NOTICE_UUID_FIELD: 'BT-701-notice',
    NOTICE_VERSION_FIELD: 'BT-757-notice',
    PROCEDURE_IDENTIFIER: 'BT-04-notice',
    NOTICE_TYPE_FIELD: 'BT-02-notice',
    FORM_TYPE_FIELD: 'BT-03-notice',
    LEGAL_BASIS_TYPE_FIELD: 'BT-01-notice',
    CPV_PROCEDURE_FIELD: 'BT-26(m)-Procedure',
    CPV_LOT_FIELD: 'BT-26(m)-Lot',
    RETTIFICA_OLD_UUID: 'BT-758-notice',
    RETTIFICA_GROUP: 'GR-Change'
  },

  /**
   * Mappa che converte i path dell'sdk ted con quelli del tracciato di integrazione
   *
   * Ci sono casi (vedi GR-Lot-Submission Language) che contengono spazi nell'id, pertanto li convertiamo
   */
  ExternalIntegrationFieldsMap: {
    'GR-Lot-Submission Language': 'GR-Lot-SubmissionLanguage'
  }
};

export class I18N {
  // This could be covered by 'auxiliary labels' or be something fully custom.
  // The i18nOfEditor is loaded before other translations, thus it can be used to override them.
  // This could be used to fix a typo while waiting for the next version of the SDK.
  // This can also be used to define arbitrary translated texts for use in the editor.
  static labels: any = {
    en: {
      'editor.are.you.sure': 'Are you sure?',
      'editor.the.metadata': 'Notice Metadata',
      'editor.the.root': 'Notice Form',
      'editor.add.more': 'Add one',
      'editor.remove': 'Remove',
      'editor.select': 'Select'
    },
    fr: {
      'editor.are.you.sure': 'Êtes-vous sûr ?',
      'editor.the.metadata': 'Méta données',
      'editor.the.root': 'Contenu',
      'editor.add.more': 'En ajouter',
      'editor.remove': 'Enlever',
      'editor.select': 'Choisir'
    },
    it: {
      'editor.are.you.sure': 'Confermare?',
      'editor.the.metadata': 'Notice Metadata',
      'editor.the.root': 'Notice Form',
      'editor.add.more': 'Aggiungi',
      'editor.remove': 'Rimuovi',
      'editor.select': 'Seleziona',
      'indicator|when-true': 'Si',
      'indicator|when-false': 'No',
      'field-language': 'Lingua',
      'field-currency': 'Valuta'
    }
  };

  /**
   * For demo purposes only two editor demo UI languages are provided.
   * You could also separate the UI language from the notice language if desired.
   */
  static Iso6391ToIso6393Map = {
    en: 'ENG',
    fr: 'FRA',
    it: 'ITA'
  };
}

export function idFromFieldIdAndInstanceNumber(contentId: string, instanceNumber = -1) {
  const prefix = /^\d/.test(contentId) ? '_' : ''; // prefix with an underscore if the contentId starts with a number
  const identifier = contentId.replace(/\W/g, '_').toLowerCase(); // replace all non-word characters with underscores
  const suffix = instanceNumber > -1 ? `_${instanceNumber?.toString().padStart(4, '0')}` : ''; // add an instance number if requested
  return prefix + identifier + suffix;
}

export const BACKEND_URL = new InjectionToken<string>(null);

export const MAX_LOTTI: number = 10;
export const LOTTI_LABEL: string = 'Lotti';
export const GR_LOT_ID: string = 'GR-Lot';
export const GR_RESULT_ID: string = 'GR-Result';
export const CONTRACT_NATURE: string = 'contract-nature';
// Tabella lotti
export const NEW_LOT: string = 'NEW-LOT';
export const CANCELED_NEW_LOT: string = 'CANCELED-NEW-LOT';
// Tabelle risultati
export const NEW_PARTE_OFFERENTE: string = 'NEW-PARTE-OFFERENTE';
export const CANCELED_NEW_PARTE_OFFERENTE: string = 'CANCELED-NEW-PARTE-OFFERENTE';
export const NEW_APPALTO: string = 'NEW-APPALTO';
export const CANCELED_NEW_APPALTO: string = 'CANCELED-NEW-APPALTO';
export const NEW_OFFERTA: string = 'NEW-OFFERTA';
export const CANCELED_NEW_OFFERTA: string = 'CANCELED-NEW-OFFERTA';
export const NEW_RISULTATO_LOTTO: string = 'NEW-RISULTATO-LOTTO';
export const CANCELED_NEW_RISULTATO_LOTTO: string = 'CANCELED-NEW-RISULTATO-LOTTO';
