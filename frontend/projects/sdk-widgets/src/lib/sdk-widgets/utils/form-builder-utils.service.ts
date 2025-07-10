import { Injectable, Injector } from '@angular/core';
import {
    IDictionary,
    SdkBaseService,
    SdkProviderService,
    SdkValidatorConfig,
    SdkValidatorService,
} from '@maggioli/sdk-commons';
import {
    SdkComboBoxItem,
    SdkDynamicValue,
    SdkFormBuilderConfiguration,
    SdkFormBuilderField,
    SdkFormBuilderVisibleCondition,
    SdkFormBuilderVisibleValue,
    SdkFormFieldGroupConfiguration,
    SdkTextboxMatrixCellConfig,
    SdkTextboxMatrixRowConfig,
    TSdkFormBuilderFieldType,
} from '@maggioli/sdk-controls';
import { TranslateService } from '@ngx-translate/core';
import {
    cloneDeep,
    each,
    every,
    find,
    get,
    isArray,
    isEmpty,
    isFunction,
    isNumber,
    isObject,
    isUndefined,
    set,
    size,
    some,
    toString,
} from 'lodash-es';
import { BehaviorSubject } from 'rxjs';

import { CustomParamsFunction, CustomParamsFunctionResponse, DynamicValue, ValoreTabellato } from '../model/lib.model';
import { ArrayUtils } from './array-utils.service';

@Injectable()
export class FormBuilderUtilsService extends SdkBaseService {

    constructor(inj: Injector) {
        super(inj);
    }

    /**
     * Metodo per il prepopolamento e l'esecuzione dei provider per il caricamento da descrittore di una form
     * @param formConfig la configurazione della form
     * @param populate booleano per scegliere se popolare o meno la form (esempio: populate = false -> nuovo programma, populate = true -> modifica programma)
     * @param customParamsFunction funzione per la valorizzazione custom del campo (esempio: tipo programma, stazione appaltante).
     * Deve ritornare true se deve essere utilizzato il popolamento di default, altrimenti false per non utilizzare il popolamento di default.
     * @param restObject Oggetto di riposta del servizio REST necessario per il popolamento di default
     * @param providerArgs Argomenti da passare al provider
     * @param infoBox Booleano che indica se abilitare la possibilita' di aprire l'info box del mnemonico
     * @returns la configurazione della form aggiornata
     */
    public populateForm(formConfig: SdkFormBuilderConfiguration, populate: boolean = false, customParamsFunction?: CustomParamsFunction, restObject?: any, providerArgs?: IDictionary<any>, infoBox?: boolean): SdkFormBuilderConfiguration {
        if (isObject(formConfig)) {
            each(formConfig.fields, (one: SdkFormBuilderField) => {
                if (one.type === 'FORM-SECTION') {
                    one = this.elaborateSection(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
                } else if (one.type === 'FORM-GROUP') {
                    one = this.elaborateGroup(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
                } else {
                    one = this.elaborateOne(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
                }
            });
            each(formConfig.fields, (one: SdkFormBuilderField) => {
                if (isObject(one.visibleCondition)) {
                    one = this.elaborateVisibleCondition(formConfig, one, restObject);
                }
                if (one.type === 'FORM-SECTION') {
                    one = this.checkVisibleSection(formConfig, one, restObject);
                } else if (one.type === 'FORM-GROUP') {
                    one = this.checkVisibleGroup(formConfig, one, restObject);
                }
            });
        }
        return formConfig;
    }

    public populateListCode(valoriTabellati: IDictionary<Array<ValoreTabellato>>, field: SdkFormBuilderField, restValue: any, mapping: boolean, annoInizio?: number): Array<any> {
        let comboCode: string = field.listCode;
        if (comboCode === 'sino') {
            set(field, 'data', restValue === '2' ? this.translateService.instant('COMBOBOX.NO') : this.translateService.instant('COMBOBOX.SI'));
            mapping = false;
        } else if (comboCode === 'GestioneUtenti') {
            if (restValue === '1') {
                set(field, 'data', this.translateService.instant('COMBOBOX.NESSUN-PRIVILEGIO'));
                mapping = false;
            } else if (restValue === '2') {
                set(field, 'data', this.translateService.instant('COMBOBOX.SOLA-LETTURA'));
                mapping = false;
            } else if (restValue === '3') {
                set(field, 'data', this.translateService.instant('COMBOBOX.GESTIONE-COMPLETA'));
                mapping = false;
            }
        } else if (comboCode === 'ScadenzaAccount') {
            if (restValue === '1') {
                set(field, 'data', this.translateService.instant('COMBOBOX.SCADENZA-ACCOUNT-MAI'));
                mapping = false;
            } else if (restValue === '2') {
                set(field, 'data', this.translateService.instant('COMBOBOX.SCADENZA-ACCOUNT-ALLA-FINE-DI'));
                mapping = false;
            }
        } else if (comboCode === 'ControlliGdpr') {
            if (restValue === '1') {
                set(field, 'data', this.translateService.instant('COMBOBOX.SI'));
                mapping = false;
            } else if (restValue === '2') {
                set(field, 'data', this.translateService.instant('COMBOBOX.NO'));
                mapping = false;
            }
        } else if (comboCode === 'PrivilegiUtenteContratti') {
            if (restValue === 'A') {
                set(field, 'data', this.translateService.instant('SDK-UTENTE.PRIVILEGI-UTENTE-CONTRATTI.A'));
                mapping = false;
            } else if (restValue === 'C') {
                set(field, 'data', this.translateService.instant('SDK-UTENTE.PRIVILEGI-UTENTE-CONTRATTI.C'));
                mapping = false;
            } else if (restValue === 'U') {
                set(field, 'data', this.translateService.instant('SDK-UTENTE.PRIVILEGI-UTENTE-CONTRATTI.U'));
                mapping = false;
            }
        } else if (comboCode === 'PrivilegiUtenteDL229') {
            if (restValue === 'A') {
                set(field, 'data', this.translateService.instant('SDK-UTENTE.PRIVILEGI-UTENTE-DL229.A'));
                mapping = false;
            } else if (restValue === 'U') {
                set(field, 'data', this.translateService.instant('SDK-UTENTE.PRIVILEGI-UTENTE-DL229.U'));
                mapping = false;
            }
        } else if (comboCode === 'ProtocolloPosta') {
            if (restValue === '0') {
                set(field, 'data', this.translateService.instant('SDK-SERVER-POSTA.PROTOCOLLO-POSTA.SMTP'));
                mapping = false;
            } else if (restValue === '1') {
                set(field, 'data', this.translateService.instant('SDK-SERVER-POSTA.PROTOCOLLO-POSTA.SMTPS'));
                mapping = false;
            } else if (restValue === '2') {
                set(field, 'data', this.translateService.instant('SDK-SERVER-POSTA.PROTOCOLLO-POSTA.STARTTLS'));
                mapping = false;
            }
        } else {
            let tabellati: Array<ValoreTabellato> = get(valoriTabellati, comboCode);
            each(tabellati, (tabellato: ValoreTabellato) => {
                if (tabellato.codice === restValue) {
                    set(field, 'data', tabellato.descrizione);
                    mapping = false;
                }
            });
        }
        return [field, mapping];
    }

    public elaborateFieldValidators(field: SdkFormBuilderField): SdkFormBuilderField {
        if (field != null && !isEmpty(field.validators)) {
            each(field.validators, (one: any) => {
                let config: SdkValidatorConfig = one.config;
                if (config != null && get(config, 'required') === true) {
                    one.validator = this.validator.run('MANDATORY', one.messages);
                } else if (config != null && !isEmpty(get(config, 'regexp'))) {
                    one.validator = this.validator.run('REGEXP', one.messages);
                } else {
                    one.validator = this.validator.run(one.validator, one.messages);
                }
            });
        }
        return field;
    }

    // #region Private

    protected elaborateOne(
        field: SdkFormBuilderField,
        populate: boolean,
        customParamsFunction?: CustomParamsFunction,
        restObject?: any,
        providerArgs?: IDictionary<any>,
        infoBox?: boolean
    ): SdkFormBuilderField {

        let mapping: boolean = true;
        const dynamicField: boolean = field.dynamicField === true;

        if (isFunction(customParamsFunction)) {
            let resp: CustomParamsFunctionResponse = customParamsFunction(field, restObject, dynamicField);
            mapping = resp.mapping;
            if (mapping === false) {
                field = resp.field;
            }
        }

        if (populate === true && mapping === true && dynamicField === false) {
            if (field.type === 'COMBOBOX') {
                let key: string = get(restObject, field.mappingInput);
                let comboItem: SdkComboBoxItem = {
                    key,
                    value: ''
                }
                set(field, 'data', comboItem);
            } else if (field.type === 'DATEPICKER') {
                let value: string = get(restObject, field.mappingInput);
                if (value != null) {
                    set(field, 'data', new Date(value));
                }
            } else {
                set(field, 'data', get(restObject, field.mappingInput));
            }
        }

        if (!isEmpty(field.itemsProviderCode)) {
            field.itemsProvider = this.provider.run(field.itemsProviderCode, providerArgs);
        } else if (field.type === 'MULTISELECT') {
            field.subject = new BehaviorSubject([]);
            field.itemsProvider = () => { return field.subject };
        }

        if (infoBox === true) {
            field.infoBox = true;
        }

        field = this.elaborateFieldValidators(field);

        if (field.type === 'TEXTBOX-MATRIX') {
            // generazione codici univoci per testata/righe/celle non valorizzate a descrittore
            each(field.header, (one: SdkTextboxMatrixCellConfig) => {
                if (isUndefined(one.code) || isEmpty(one.code)) {
                    one.code = this.generateUniqueCode();
                }
            });
            each(field.rows, (one: SdkTextboxMatrixRowConfig) => {
                if (isUndefined(one.code) || isEmpty(one.code)) {
                    one.code = this.generateUniqueCode();
                }
                each(one.cells, (cell: SdkTextboxMatrixCellConfig) => {
                    if (isUndefined(cell.code) || isEmpty(cell.code)) {
                        cell.code = this.generateUniqueCode();
                    }
                    if (!isEmpty(cell.mappingInput)) {
                        cell.value = get(restObject, cell.mappingInput);
                    }
                });
            });
        }

        if (field.type === 'DYNAMIC-FORM-SECTION') {
            delete field.data;
            set(field, 'dynamicFieldValues', get(restObject, field.mappingInput));
        }

        return field;
    }

    private elaborateSection(field: SdkFormBuilderField, populate: boolean, customParamsFunction?: CustomParamsFunction, restObject?: any, providerArgs?: IDictionary<any>, infoBox?: boolean): SdkFormBuilderField {
        if (field.mappingInput) {
            if (isUndefined(field.fieldSections)) {
                field.fieldSections = new Array();
            }
            let fields: Array<SdkFormBuilderField> = new Array();
            let data: Array<DynamicValue> = get(restObject, field.mappingInput);
            each(data, (one: DynamicValue) => {
                let clField: SdkFormBuilderField = cloneDeep(field.defaultFormSectionField);
                clField.dynamicField = true;
                clField.code = toString(one.codice);
                clField.label = one.descrizione;
                if (clField.type === 'COMBOBOX') {
                    let comboItem: SdkComboBoxItem = {
                        key: toString(one.value),
                        value: ''
                    }
                    clField.data = comboItem;
                } else {
                    clField.data = toString(one.value);
                }
                fields.push(clField);
            });
            field.fieldSections = [...fields, ...field.fieldSections];
        }
        each(field.fieldSections, (one: SdkFormBuilderField) => {
            if (one.type === 'FORM-SECTION') {
                one = this.elaborateSection(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
            } else if (one.type === 'FORM-GROUP') {
                one = this.elaborateGroup(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
            } else {
                one = this.elaborateOne(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
            }
        });
        return field;
    }

    private elaborateGroup(field: SdkFormBuilderField, populate: boolean, customParamsFunction?: CustomParamsFunction, restObject?: any, providerArgs?: IDictionary<any>, infoBox?: boolean): SdkFormBuilderField {
        let newRestObjects: Array<any>;
        if (!isEmpty(field.mappingInput)) {
            newRestObjects = get(restObject, field.mappingInput);
        }

        if (isObject(newRestObjects)) {
            each(field.defaultFormGroupFields, (one: SdkFormBuilderField) => {
                if (one.type === 'FORM-SECTION') {
                    one = this.elaborateSection(one, false, customParamsFunction, {}, providerArgs, infoBox);
                } else if (one.type === 'FORM-GROUP') {
                    one = this.elaborateGroup(one, false, customParamsFunction, {}, providerArgs, infoBox);
                } else {
                    one = this.elaborateOne(one, false, customParamsFunction, {}, providerArgs, infoBox);
                }
            });

            if (size(newRestObjects) > 0) {
                let defaultFormGroupFields: Array<SdkFormBuilderField> = cloneDeep(field.defaultFormGroupFields);
                let base: SdkFormFieldGroupConfiguration = {
                    code: '',
                    fields: defaultFormGroupFields
                };

                // riempio n volte quanti sono gli elementi dell'array REST
                let groups: Array<SdkFormFieldGroupConfiguration> = ArrayUtils.fill(new Array(size(newRestObjects)), base);
                each(groups, (group: SdkFormFieldGroupConfiguration, index: number) => {
                    group.code = this.generateUniqueCode();
                    // prendo l'i-esimo oggetto della risposta REST
                    let singleIterationObject: any = newRestObjects[index];
                    each(group.fields, (one: SdkFormBuilderField) => {
                        if (one.type === 'FORM-SECTION') {
                            one = this.elaborateSection(one, populate, customParamsFunction, singleIterationObject, providerArgs, infoBox);
                        } else if (one.type === 'FORM-GROUP') {
                            one = this.elaborateGroup(one, populate, customParamsFunction, singleIterationObject, providerArgs, infoBox);
                        } else {
                            one = this.elaborateOne(one, populate, customParamsFunction, singleIterationObject, providerArgs, infoBox);
                        }
                    });
                });
                field.fieldGroups = groups;
            }
        } else {

            each(field.defaultFormGroupFields, (one: SdkFormBuilderField) => {
                if (one.type === 'FORM-SECTION') {
                    one = this.elaborateSection(one, false, customParamsFunction, {}, providerArgs, infoBox);
                } else if (one.type === 'FORM-GROUP') {
                    one = this.elaborateGroup(one, false, customParamsFunction, {}, providerArgs, infoBox);
                } else {
                    one = this.elaborateOne(one, false, customParamsFunction, {}, providerArgs, infoBox);
                }
            });

            each(field.fieldGroups, (group: SdkFormFieldGroupConfiguration, index: number) => {
                each(group.fields, (one: SdkFormBuilderField) => {
                    if (one.type === 'FORM-SECTION') {
                        one = this.elaborateSection(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
                    } else if (one.type === 'FORM-GROUP') {
                        one = this.elaborateGroup(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
                    } else {
                        one = this.elaborateOne(one, populate, customParamsFunction, restObject, providerArgs, infoBox);
                    }
                });
                field.fieldGroups[index] = group;
            });
        }

        return field;
    }

    private generateUniqueCode(): string {
        return Math.random().toString(36).slice(2); // NOSONAR
    }

    private getField(formConfig: SdkFormBuilderConfiguration, fieldCode: string): SdkFormBuilderField {
        let fieldFound: SdkFormBuilderField;
        each(formConfig.fields, (one: SdkFormBuilderField) => {
            if (one.code === fieldCode) {
                fieldFound = one;
                return false;
            } else {
                if (one.type === 'FORM-SECTION') {
                    fieldFound = this.getFieldSection(one, fieldCode);
                    if (isObject(fieldFound)) {
                        return false;
                    }
                } else if (one.type === 'FORM-GROUP') {
                    fieldFound = this.getFieldGroup(one, fieldCode);
                    if (isObject(fieldFound)) {
                        return false;
                    }
                } else if (one.type === 'TEXTBOX-MATRIX') {
                    fieldFound = this.getFieldMatrix(one, fieldCode);
                    if (isObject(fieldFound)) {
                        return false;
                    }
                }
            }
        });
        return fieldFound;
    }

    private getFieldSection(field: SdkFormBuilderField, fieldCode: string): SdkFormBuilderField {
        let fieldFound: SdkFormBuilderField;
        each(field.fieldSections, (one: SdkFormBuilderField) => {
            if (one.code === fieldCode) {
                fieldFound = one;
                return false;
            } else {
                if (one.type === 'FORM-SECTION') {
                    fieldFound = this.getFieldSection(one, fieldCode);
                    if (isObject(fieldFound)) {
                        return false;
                    }
                } else if (one.type === 'FORM-GROUP') {
                    fieldFound = this.getFieldGroup(one, fieldCode);
                    if (isObject(fieldFound)) {
                        return false;
                    }
                } else if (one.type === 'TEXTBOX-MATRIX') {
                    fieldFound = this.getFieldMatrix(one, fieldCode);
                    if (isObject(fieldFound)) {
                        return false;
                    }
                }
            }
        });
        return fieldFound;
    }

    private getFieldGroup(field: SdkFormBuilderField, fieldCode: string): SdkFormBuilderField {
        let fieldFound: SdkFormBuilderField;
        each(field.fieldGroups, (group: SdkFormFieldGroupConfiguration, index: number) => {
            each(group.fields, (one: SdkFormBuilderField) => {
                if (one.code === fieldCode) {
                    fieldFound = one;
                    return false;
                } else {
                    if (one.type === 'FORM-SECTION') {
                        fieldFound = this.getFieldSection(one, fieldCode);
                        if (isObject(fieldFound)) {
                            return false;
                        }
                    } else if (one.type === 'FORM-GROUP') {
                        fieldFound = this.getFieldGroup(one, fieldCode);
                        if (isObject(fieldFound)) {
                            return false;
                        }
                    } else if (one.type === 'TEXTBOX-MATRIX') {
                        fieldFound = this.getFieldMatrix(one, fieldCode);
                        if (isObject(fieldFound)) {
                            return false;
                        }
                    }
                }
                if (isObject(fieldFound)) {
                    return false;
                }
            });
        });
        return fieldFound;
    }

    private getFieldMatrix(field: SdkFormBuilderField, fieldCode: string): SdkFormBuilderField {
        let fieldFound: SdkFormBuilderField;
        each(field.rows, (row: SdkTextboxMatrixRowConfig) => {
            each(row.cells, (cell: SdkTextboxMatrixCellConfig) => {
                if (cell.code === fieldCode) {
                    fieldFound = { ...cell };
                    return false;
                }
            })
            if (isObject(fieldFound)) {
                return false;
            }
        });
        return fieldFound;
    }

    private elaborateVisibleCondition(formConfig: SdkFormBuilderConfiguration, field: SdkFormBuilderField, restObject: any) {
        if (isObject(field.visibleCondition.and)) {
            each(field.visibleCondition.and, (condition: SdkFormBuilderVisibleCondition, key: string) => {
                let found: SdkFormBuilderField = this.getField(formConfig, key);
                if (isObject(found)) {
                    let data: any = found.data;
                    if (found.type === 'DYNAMIC-FORM-SECTION') {
                        data = [];
                        each(found.dynamicFieldValues, (one: SdkDynamicValue) => {
                            if (one.value === 1) {
                                data.push(one.codice);
                            }
                        });
                    } else {
                        if (!isEmpty(found.listCode) && isObject(restObject) && !isObject(data)) {
                            data = get(restObject, found.mappingInput);
                        }
                    }

                    let finalCond: boolean = false;
                    let visible: boolean = false;
                    let othersVisible: boolean = false;
                    if (isObject(data)) {
                        let dataTipo: string | number | Array<any> = isObject(data) && !isArray(data) ? get(data, 'key') : data;
                        visible = this.verifyVisibleValueCondition(condition, dataTipo, found.type, 'and');
                    } else {
                        visible = this.verifyVisibleValueCondition(condition, data, found.type, 'and');
                    }

                    condition.visible = visible;

                    let countOther: number = 0;
                    each(field.visibleCondition.and, (cond: SdkFormBuilderVisibleCondition, key: string) => {
                        if (cond.visible === true && key !== found.code) {
                            countOther++;
                        }
                    });

                    othersVisible = size(field.visibleCondition.and) === 1 || (countOther == size(field.visibleCondition.and) - 1);
                    finalCond = visible === true && othersVisible === true;
                    field.visible = finalCond;
                }
            });
        } else if (isObject(field.visibleCondition.or)) {
            each(field.visibleCondition.or, (condition: SdkFormBuilderVisibleCondition, key: string) => {
                let found: SdkFormBuilderField = this.getField(formConfig, key);
                if (isObject(found)) {
                    let data: any = found.data;
                    if (found.type === 'DYNAMIC-FORM-SECTION') {
                        data = [];
                        each(found.dynamicFieldValues, (one: SdkDynamicValue) => {
                            if (one.value === 1) {
                                data.push(one.codice);
                            }
                        });
                    } else {
                        if (!isEmpty(found.listCode) && isObject(restObject) && !isObject(data)) {
                            data = get(restObject, found.mappingInput);
                        }
                    }
                    let finalCond: boolean = false;
                    let visible: boolean = false;
                    let othersVisible: boolean = false;
                    if (isObject(data)) {
                        let dataTipo: string | number | Array<any> = isObject(data) && !isArray(data) ? get(data, 'key') : data;
                        visible = this.verifyVisibleValueCondition(condition, dataTipo, found.type, 'or');
                    } else {
                        visible = this.verifyVisibleValueCondition(condition, data, found.type, 'or');
                    }

                    condition.visible = visible;

                    let item: SdkFormBuilderVisibleCondition = find(field.visibleCondition.or, (cond: SdkFormBuilderVisibleCondition, key: string) => {
                        return cond.visible === true && key !== found.code;
                    });

                    othersVisible = isObject(item);
                    finalCond = visible === true || othersVisible === true;
                    field.visible = finalCond;
                }
            });
        }
        return field;
    }

    private checkVisibleSection(formConfig: SdkFormBuilderConfiguration, field: SdkFormBuilderField, restObject: any): SdkFormBuilderField {
        each(field.fieldSections, (one: SdkFormBuilderField) => {
            if (isObject(one.visibleCondition)) {
                one = this.elaborateVisibleCondition(formConfig, one, restObject);
            }
            if (one.type === 'FORM-SECTION') {
                one = this.checkVisibleSection(formConfig, one, restObject);
            } else if (one.type === 'FORM-GROUP') {
                one = this.checkVisibleGroup(formConfig, one, restObject);
            }

        });
        return field;
    }

    private checkVisibleGroup(formConfig: SdkFormBuilderConfiguration, field: SdkFormBuilderField, restObject: any): SdkFormBuilderField {
        each(field.fieldGroups, (group: SdkFormFieldGroupConfiguration, index: number) => {
            each(group.fields, (one: SdkFormBuilderField) => {
                if (isObject(one.visibleCondition)) {
                    one = this.elaborateVisibleCondition(formConfig, one, restObject);
                }
                if (one.type === 'FORM-SECTION') {
                    one = this.checkVisibleSection(formConfig, one, restObject);
                } else if (one.type === 'FORM-GROUP') {
                    one = this.checkVisibleGroup(formConfig, one, restObject);
                }
            });
        });
        return field;
    }


    private verifyVisibleValueCondition(condition: SdkFormBuilderVisibleCondition, actualValue: string | number | Array<any>, type: TSdkFormBuilderFieldType, operationType: string): boolean {
        let visible: boolean = false;

        let valoriPossibili: Array<SdkFormBuilderVisibleValue> = condition.values;
        let visibili: Array<boolean> = new Array();
        each(valoriPossibili, (one: SdkFormBuilderVisibleValue) => {
            let operation: string = one.operation;
            operation = operation === '=' ? '==' : operation;

            let condizioneDaVerificare: string;
            let verificata: boolean;
            if (type === 'TEXTBOX-MATRIX' || type === 'NUMERIC-TEXTBOX') {
                condizioneDaVerificare = actualValue + operation + one.value;
            } else if (type === 'DYNAMIC-FORM-SECTION') {
                if (one.value != null) {
                    let singoloValue = find(<Array<any>>actualValue, (singolo: any) => {
                        return singolo == one.value;
                    });
                    verificata = singoloValue != null;
                }
            } else {
                if (one.value == null || actualValue == null) {
                    if (one.value != null && actualValue == null) {
                        condizioneDaVerificare = actualValue + operation + '"' + one.value + '"';
                    } else if (one.value == null && actualValue != null) {
                        condizioneDaVerificare = '"' + actualValue + '"' + operation + one.value;
                    } else {
                        condizioneDaVerificare = actualValue + operation + one.value;
                    }
                } else {
                    if (isNumber(actualValue) && isNumber(one.value)) {
                        condizioneDaVerificare = actualValue + operation + one.value;
                    } else {
                        condizioneDaVerificare = '"' + actualValue + '"' + operation + '"' + one.value + '"';
                    }
                }
            }
            if (condizioneDaVerificare != null) {
                verificata = (new Function('return ' + condizioneDaVerificare))(); // NOSONAR
            }
            visibili.push(verificata);
        });

        const opType: string = condition.singleVisibleType != null ? condition.singleVisibleType : operationType;
        if (opType === 'and') {
            visible = every(visibili, (one: boolean) => one === true);
        } else if (opType === 'or') {
            visible = some(visibili, (one: boolean) => one === true);
        }

        return visible;
    }

    // #endregion

    // #region Getters

    private get validator(): SdkValidatorService { return this.injectable(SdkValidatorService) }

    private get provider(): SdkProviderService { return this.injectable(SdkProviderService) }

    private get translateService(): TranslateService { return this.injectable(TranslateService) }

    // #endregion
}