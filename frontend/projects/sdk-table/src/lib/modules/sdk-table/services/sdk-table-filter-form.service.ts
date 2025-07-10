import { Injectable } from '@angular/core';
import { IDictionary, SdkDateHelper } from '@maggioli/sdk-commons';
import {
    SdkAutocompleteItem,
    SdkFormBuilderConfiguration,
    SdkFormBuilderField,
    SdkFormFieldGroupConfiguration,
} from '@maggioli/sdk-controls';
import { cloneDeep, each, get, isEmpty, isObject, isString, isUndefined, set } from 'lodash-es';

@Injectable({ providedIn: 'root' })
export class SdkTableFilterFormService {

    constructor(private sdkDateHelper: SdkDateHelper) { }

    // #region Public

    public getFilterModel(formBuilderConfig: SdkFormBuilderConfiguration): IDictionary<any> {
        const filters: IDictionary<any> = this.populateFiltri(formBuilderConfig);
        return filters;
    }

    public getActiveFilters(formBuilderConfig: SdkFormBuilderConfiguration): Array<SdkFormBuilderField> {
        const filters: Array<SdkFormBuilderField> = this.populateActiveFilters(formBuilderConfig);
        return filters;
    }

    // #endregion

    // #region Private

    private populateFiltri(formBuilderConfig: SdkFormBuilderConfiguration): IDictionary<any> {
        let request: IDictionary<any> = {};
        each(formBuilderConfig.fields, (field: SdkFormBuilderField) => {
            if (field.type === 'FORM-SECTION') {
                request = this.elaborateSection(field, request);
            } else if (field.type === 'FORM-GROUP') {
                request = this.elaborateGroup(field, request);
            } else {
                request = this.elaborateOne(field, request);
            }
        });
        return request;
    }

    private elaborateSection(field: SdkFormBuilderField, request: IDictionary<any>): IDictionary<any> {
        each(field.fieldSections, (one: SdkFormBuilderField) => {
            if (one.type === 'FORM-SECTION') {
                request = this.elaborateSection(one, request);
            } else if (one.type === 'FORM-GROUP') {
                request = this.elaborateGroup(one, request);
            } else {
                request = this.elaborateOne(one, request);
            }
        });
        return request;
    }

    private elaborateGroup(field: SdkFormBuilderField, request: IDictionary<any>): IDictionary<any> {
        if (field.visible !== false) {
            let newRestObjects: Array<any>;
            if (!isEmpty(field.mappingOutput)) {
                newRestObjects = get(request, field.mappingOutput);
                if (isUndefined(newRestObjects)) {
                    newRestObjects = new Array();
                }
            }

            if (isObject(newRestObjects)) {
                each(field.fieldGroups, (group: SdkFormFieldGroupConfiguration) => {
                    let singleIterationObject: any = {};
                    each(group.fields, (one: SdkFormBuilderField) => {
                        if (one.type === 'FORM-SECTION') {
                            singleIterationObject = this.elaborateSection(one, singleIterationObject);
                        } else if (one.type === 'FORM-GROUP') {
                            singleIterationObject = this.elaborateGroup(one, singleIterationObject);
                        } else {
                            singleIterationObject = this.elaborateOne(one, singleIterationObject);
                        }
                    });
                    newRestObjects.push(singleIterationObject);
                });
                set(request, field.mappingOutput, newRestObjects);
            } else {
                each(field.fieldGroups, (group: SdkFormFieldGroupConfiguration, index: number) => {
                    each(group.fields, (one: SdkFormBuilderField) => {
                        if (one.type === 'FORM-SECTION') {
                            request = this.elaborateSection(one, request);
                        } else if (one.type === 'FORM-GROUP') {
                            request = this.elaborateGroup(one, request);
                        } else {
                            request = this.elaborateOne(one, request);
                        }
                    });
                    field.fieldGroups[index] = group;
                });
            }
        }
        return request;
    }

    private elaborateOne(field: SdkFormBuilderField, request: IDictionary<any>): IDictionary<any> {
        if (isObject(field) && !isEmpty(field.mappingOutput)) {

            let path: string = field.mappingOutput;

            if (field.type === 'COMBOBOX') {
                if (field.data != null) {
                    set(request, path, field.data.key);
                }
            } else if (field.type === 'AUTOCOMPLETE') {
                if (field.data != null) {
                    let obj: SdkAutocompleteItem = field.data;
                    set(request, field.mappingOutput, obj._key);
                }
            } else if (field.type === 'DATEPICKER') {
                if (field.data != null) {
                    let data: Date = get(field, 'data');
                    if (isObject(data)) {
                        let format: string = 'yyyy-MM-dd';
                        let formatted: string = this.sdkDateHelper.format(data, format);
                        set(request, path, formatted);
                    }
                }
            } else {
                let first: boolean = field.data != null;
                let second: boolean = !isString(field.data) || (isString(field.data) && !isEmpty(field.data));
                if (first && second) {
                    set(request, path, field.data);
                }
            }
        }
        return request;
    }

    private populateActiveFilters(formBuilderConfig: SdkFormBuilderConfiguration): Array<SdkFormBuilderField> {
        let request: Array<SdkFormBuilderField> = [];
        each(formBuilderConfig.fields, (field: SdkFormBuilderField) => {
            if (field.type === 'FORM-SECTION') {
                request = this.elaborateSectionActiveFilters(field, request);
            } else if (field.type === 'FORM-GROUP') {
                request = this.elaborateGroupActiveFilters(field, request);
            } else {
                request = this.elaborateOneActiveFilters(field, request);
            }
        });
        return request;
    }

    private elaborateSectionActiveFilters(field: SdkFormBuilderField, request: Array<SdkFormBuilderField>): Array<SdkFormBuilderField> {
        each(field.fieldSections, (one: SdkFormBuilderField) => {
            if (one.type === 'FORM-SECTION') {
                request = this.elaborateSectionActiveFilters(one, request);
            } else if (one.type === 'FORM-GROUP') {
                request = this.elaborateGroupActiveFilters(one, request);
            } else {
                request = this.elaborateOneActiveFilters(one, request);
            }
        });
        return request;
    }

    private elaborateGroupActiveFilters(field: SdkFormBuilderField, request: Array<SdkFormBuilderField>): Array<SdkFormBuilderField> {
        if (field.visible !== false) {
            let newRestObjects: Array<any>;
            if (!isEmpty(field.mappingOutput)) {
                newRestObjects = get(request, field.mappingOutput);
                if (isUndefined(newRestObjects)) {
                    newRestObjects = new Array();
                }
            }

            if (isObject(newRestObjects)) {
                each(field.fieldGroups, (group: SdkFormFieldGroupConfiguration) => {
                    let singleIterationObject: any = {};
                    each(group.fields, (one: SdkFormBuilderField) => {
                        if (one.type === 'FORM-SECTION') {
                            singleIterationObject = this.elaborateSectionActiveFilters(one, singleIterationObject);
                        } else if (one.type === 'FORM-GROUP') {
                            singleIterationObject = this.elaborateGroupActiveFilters(one, singleIterationObject);
                        } else {
                            singleIterationObject = this.elaborateOneActiveFilters(one, singleIterationObject);
                        }
                    });
                    newRestObjects.push(singleIterationObject);
                });
                set(request, field.mappingOutput, newRestObjects);
            } else {
                each(field.fieldGroups, (group: SdkFormFieldGroupConfiguration, index: number) => {
                    each(group.fields, (one: SdkFormBuilderField) => {
                        if (one.type === 'FORM-SECTION') {
                            request = this.elaborateSectionActiveFilters(one, request);
                        } else if (one.type === 'FORM-GROUP') {
                            request = this.elaborateGroupActiveFilters(one, request);
                        } else {
                            request = this.elaborateOneActiveFilters(one, request);
                        }
                    });
                    field.fieldGroups[index] = group;
                });
            }
        }
        return request;
    }

    private elaborateOneActiveFilters(field: SdkFormBuilderField, request: Array<SdkFormBuilderField>): Array<SdkFormBuilderField> {
        if (field && field.data) {
            request.push(cloneDeep(field));
        }
        return request;
    }

    // #endregion
}