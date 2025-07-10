import { WritableSignal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { IDictionary } from '@maggioli/sdk-commons';
import { CvsModalData, CvsOutputDTO } from './api.model';

export interface FirstLevelItem {
  id: string;
  label: string;
  labelParams?: IDictionary<any>;
  items?: Array<FirstLevelItem>;
}

export interface HomePageCard {
  code?: string;
  icon?: string;
  label: string;
  labelParams?: IDictionary<any>;
  slug?: string;
  url?: string;
  params?: IDictionary<string>;
  // chiave per il parametro addizionale della label
  additionalParamsKey?: string;
}

export interface InputChangeEvent {
  id: string;
  count: number;
  value: any;
}

export class FieldBase<T> {
  value: T | undefined;
  key: string;
  label: string;
  required: boolean;
  order: number;
  contentType: string;
  displayType: string;
  type: string;
  visualModelContent: any;
  children: Array<FieldBase<string>>;

  constructor(
    options: {
      value?: T;
      key?: string;
      label?: string;
      required?: boolean;
      order?: number;
      contentType?: string;
      displayType?: string;
      type?: string;
      visualModelContent?: any;
      children?: Array<FieldBase<string>>;
    } = {}
  ) {
    this.value = options.value;
    this.key = options.key || '';
    this.label = options.label || '';
    this.required = !!options.required;
    this.order = options.order === undefined ? 1 : options.order;
    this.contentType = options.contentType || null;
    this.displayType = options.displayType || '';
    this.type = options.type || '';
    this.visualModelContent = options.visualModelContent || null;
    this.children = options.children || null;
  }
}

export class TextboxField extends FieldBase<string> {
  override displayType = 'TEXTBOX';
}

export class TextareaField extends FieldBase<string> {
  override displayType = 'TEXTAREA';
}

export class CheckboxField extends FieldBase<string> {
  override displayType = 'CHECKBOX';
}

export class RadioField extends FieldBase<string> {
  override displayType = 'RADIO';
}

export class ComboboxField extends FieldBase<string> {
  override displayType = 'COMBOBOX';
}

export interface AccordionItem {
  id: string;
  label: string;
  index?: string;
  lastLevel?: boolean;
  items?: Array<AccordionItem>;
  labelId?;
  isLastClicked?: boolean;
  key?: string; // usato per sezione "Risultati"
}

export interface AccordionOutput {
  id: string;
  label?: string;
  index?: string;
  isLastClicked?: boolean;
  key?: string; // usato per sezione "Risultati"
}

export interface AccordionEvent {
  event: AccordionEventType;
  value?: AccordionOutput | string;
}

export type AccordionEventType = 'TOGGLE' | 'ADD' | 'REMOVE' | 'CLEAR';

export interface IVisualModelElement {
  contentId: string;
  contentType: string;
  contentCount: string;
  children?: Array<IVisualModelElement>;
  visType: string;
  visNodeId?: string;
  value?: string;
  sdkVersion?: string;
  noticeSubType?: string;
  noticeUuid?: string;
  labelId?: string;
}

export interface IVisualModelOutput {
  data?: IVisualModelElement;
  validation?: Array<string>;
}

export interface OutputRestModalConfig {
  type: OutputRestModalType;
  content: string;
}

export interface OutputCvsValidationModalConfig {
  type: OutputRestModalType;
  content: CvsModalData;
  idTracciatura?: string;
  errorMessage?: string;
}

export type OutputRestModalType = 'JSON' | 'XML' | 'XSD-VALIDATION' | 'CVS-VALIDATION' | 'PDF-PREVIEW';

export interface IFieldCondition {
  forbidden: Array<IFieldSingleCondition>;
  mandatory: Array<IFieldSingleCondition>;
}

export interface IFieldSingleCondition {
  condition: string;
  parentId?: string;
}

export enum TForbiddenCheck {
  NOT_CHECKED,
  FORBIDDEN,
  NOT_FORBIDDEN
}

export interface NoticeInfo {
  description: string;
  sdkVersion: string;
  subTypeId: string;
  uuid: string;
  noticeVersion: string;
}

export interface IComboboxOption {
  key: string;
  label: string;
}

export interface ExtendedFormControl<T> extends FormControl {
  customProperties: T;
}

export interface InvalidField {
  invalid: WritableSignal<boolean>;
}

export interface ErrorNavigationState {
  navigate: boolean;
  target: AccordionOutput | null;
}

export interface CustomChecks {
  cvsOutputDTO: CvsOutputDTO | null;
  passedChecks: boolean;
}

export interface CustomChecks {
  cvsOutputDTO: CvsOutputDTO | null;
  passedChecks: boolean;
}

export interface LottoItem {
  numero: number;
  label: string;
  oggetto: string;
  tipologiaAppalto: string;
  importoComplessivo: number;
}

export interface ParteOfferenteItem {
  numero: number;
  id: string;
  nome: string;
}

export interface AppaltoItem {
  numero: number;
  id: string;
  identificativo: string;
  titolo: string;
}

export interface OffertaItem {
  numero: number;
  id: string;
  identificativo: string;
  valore: number;
}

export interface RisultatoDelLottoItem {
  numero: number;
  id: string;
  identificativo: string;
}

export interface ItemExpanded {
  id: string;
  expanded: boolean;
  key?: string;
}
