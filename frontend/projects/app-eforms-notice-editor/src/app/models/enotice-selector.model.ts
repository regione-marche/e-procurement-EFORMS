export interface DirettivaItem {
  code: string;
  label: string;
  tipi: Array<TipoEnoticeItem>;
}

export interface TipoEnoticeItem {
  code: string;
  label: string;
  enotices: Array<EnoticeSelectorItem>;
}

export interface EnoticeSelectorItem {
  code: string;
  label: string;
}
