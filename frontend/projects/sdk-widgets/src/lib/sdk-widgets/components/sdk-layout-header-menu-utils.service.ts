import { Injectable, Injector } from '@angular/core';
import { IDictionary, SdkBaseService, SdkProviderService, UserProfile } from '@maggioli/sdk-commons';
import { SdkAdvancedSearchCategoryConfig, SdkDropdownButtonData, SdkMenuItem } from '@maggioli/sdk-controls';
import { each, get, has, head, isEmpty, reduce, remove, split } from 'lodash-es';

interface ProfiloConfiguration {
    idProfilo: string;
    ok: boolean;
    nome: string;
    configurazioni: Array<ProfiloConfigurationItem>;
}

interface ProfiloConfigurationItem {
    key?: string;
    valore?: boolean;
    ok?: boolean;
    valDefault?: number;
    okDefault?: boolean;
    default?: boolean;
}


@Injectable({ providedIn: 'root' })
export class SdkLayoutMenuHeaderUtilsService extends SdkBaseService {

    private readonly typeMap: IDictionary<string> = {
        COLONNE: 'COLS',
        FUNZIONI: 'FUNZ',
        MASCHERE: 'MASC',
        MENU: 'MENU',
        PAGINE: 'PAGE',
        SEZIONI: 'SEZ',
        SUBMENU: 'SUBMENU',
        TABS: 'TABS'
    };
    private readonly actionVis: string = 'VIS';
    private readonly actionMan: string = 'MAN';
    private readonly actionMod: string = 'MOD';
    private readonly actionDel: string = 'DEL';

    constructor(inj: Injector) { super(inj) }

    public checkMenu(items: Array<SdkMenuItem>, userProfile: UserProfile): Array<SdkMenuItem> {
        if (items != null) {
            const fieldsToRemove: Array<string> = new Array();
            each(items, (one: SdkMenuItem) => {
                if (one.oggettoProtezione != null) {
                    const visible: boolean = this.isMenuItemVisible(one.oggettoProtezione, userProfile.configurations, 'MENU');
                    if (visible === false) {
                        fieldsToRemove.push(one.code);
                    }
                }

                if (one.visibleProvider != null) {
                    const visible: boolean = this.provider.run(one.visibleProvider, { userProfile });
                    if (visible === false && !fieldsToRemove.includes(one.code)) {
                        fieldsToRemove.push(one.code);
                    }
                }

                if (one.items != null) {
                    this.elaborateSubmenu(one.code, one.items, userProfile, fieldsToRemove);
                }
            });
            if (fieldsToRemove.length > 0) {
                remove(items, (one: SdkMenuItem) => {
                    return fieldsToRemove.indexOf(one.code) != -1;
                });
                each(items, (one: SdkMenuItem) => {
                    if (one.items != null) {
                        one.items = this.deleteSubmenu(one.items, fieldsToRemove);
                    }
                });
            }
            return items;
        }
        return null;
    }

    public checkAdvancedSearch(items: Array<SdkAdvancedSearchCategoryConfig>, userProfile: UserProfile): Array<SdkAdvancedSearchCategoryConfig> {
        if (items != null) {
            const fieldsToRemove: Array<number> = new Array();
            each(items, (one: SdkAdvancedSearchCategoryConfig, index: number) => {
                if (one.oggettoProtezione != null) {
                    const visible: boolean = this.isMenuItemVisible(one.oggettoProtezione, userProfile.configurations, 'MENU');
                    if (visible === false) {
                        fieldsToRemove.push(index);
                    } else {
                        const visibleSubmenu: boolean = this.isMenuItemVisible(one.oggettoProtezione, userProfile.configurations, 'SUBMENU');
                        if (visibleSubmenu === false) {
                            fieldsToRemove.push(index);
                        }
                    }
                }
            });
            if (fieldsToRemove.length > 0) {
                remove(items, (one: SdkAdvancedSearchCategoryConfig, index: number) => {
                    return fieldsToRemove.indexOf(index) != -1;
                });
            }
            return items;
        }
        return null;
    }

    public checkDropdownData(items: Array<SdkDropdownButtonData>, userProfile: UserProfile): Array<SdkDropdownButtonData> {
        if (items != null) {
            const fieldsToRemove: Array<string> = new Array();
            each(items, (one: SdkDropdownButtonData) => {
                if (one.oggettoProtezione != null) {
                    const visible: boolean = this.isMenuItemVisible(one.oggettoProtezione, userProfile.configurations, 'SUBMENU');
                    if (visible === false) {
                        fieldsToRemove.push(one.code);
                    }
                }
            });
            if (fieldsToRemove.length > 0) {
                remove(items, (one: SdkDropdownButtonData) => {
                    return fieldsToRemove.indexOf(one.code) != -1;
                });
            }
            return items;
        }
        return null;
    }

    private elaborateSubmenu(fatherCode: string, submenuItems: Array<SdkMenuItem>, userProfile: UserProfile, fieldsToRemove: Array<string>): void {
        if (submenuItems != null) {
            let localFieldsToRemove: Array<string> = new Array();
            each(submenuItems, (one: SdkMenuItem) => {
                if (one.oggettoProtezione != null) {
                    const visible: boolean = this.isMenuItemVisible(one.oggettoProtezione, userProfile.configurations, 'SUBMENU');
                    if (visible === false) {
                        fieldsToRemove.push(one.code);
                        localFieldsToRemove.push(one.code);
                    }
                }

                if (one.visibleProvider != null) {
                    const visible: boolean = this.provider.run(one.visibleProvider, { userProfile });
                    if (visible === false && !fieldsToRemove.includes(one.code)) {
                        fieldsToRemove.push(one.code);
                        localFieldsToRemove.push(one.code);
                    }
                }

                if (one.items != null) {
                    this.elaborateSubmenu(one.code, one.items, userProfile, fieldsToRemove);
                }
            });

            if (submenuItems.length === localFieldsToRemove.length) {
                fieldsToRemove.push(fatherCode);
            }
        }
    }

    private deleteSubmenu(submenuItems: Array<SdkMenuItem>, fieldsToRemove: Array<string>): Array<SdkMenuItem> {
        if (submenuItems != null) {
            remove(submenuItems, (one: SdkMenuItem) => {
                return fieldsToRemove.indexOf(one.code) != -1;
            });
            each(submenuItems, (one: SdkMenuItem) => {
                if (one.items != null) {
                    one.items = this.deleteSubmenu(one.items, fieldsToRemove);
                }
            });
            return submenuItems;
        }
        return null;
    }

    private isMenuItemVisible(menuItemProtectionCode: string, profiloConfiguration: ProfiloConfiguration, tipo: string): boolean {
        if (!isEmpty(menuItemProtectionCode)) {
            let protectionMap: IDictionary<ProfiloConfigurationItem> = this.getProtezioniMap(profiloConfiguration);
            let type: string = get(this.typeMap, tipo);
            let keyVis: string = `${type}.${this.actionVis}.${menuItemProtectionCode}`;
            let visible: boolean = this.checkKey(protectionMap, keyVis);
            if (visible === false) {
                // se non e' visibile flaggo il campo come "da cancellare"
                return false;
            } else if (visible == null) {
                // altrimenti verifico per il gruppo schema.entity.*
                let schema: string = head(split(menuItemProtectionCode, '.'));
                let entity: string = split(menuItemProtectionCode, '.')[1];
                let schemaEntityKey: string = `${type}.${this.actionVis}.${schema}.${entity}.*`;
                visible = this.checkKey(protectionMap, schemaEntityKey);
                if (visible === false) {
                    // se non e' visibile flaggo il campo come "da cancellare"
                    return false;
                } else if (visible == null) {
                    // altrimenti verifico per il gruppo schema.*
                    let schemaKey: string = `${type}.${this.actionVis}.${schema}.*`;
                    visible = this.checkKey(protectionMap, schemaKey);
                    if (visible === false) {
                        // se non e' visibile flaggo il campo come "da cancellare"
                        return false;
                    } else if (visible == null) {
                        // altrimenti verifico per il gruppo *
                        keyVis = `${type}.${this.actionVis}.*`;
                        visible = this.checkKey(protectionMap, keyVis);
                        if (visible === false) {
                            // se non e' visibile flaggo il campo come "da cancellare" altrimenti il campo va lasciato
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }

    private getProtezioniMap(profiloConfiguration: ProfiloConfiguration): IDictionary<ProfiloConfigurationItem> {
        if (profiloConfiguration != null && profiloConfiguration.configurazioni != null) {
            let protectionMap: IDictionary<ProfiloConfigurationItem> = reduce(profiloConfiguration.configurazioni, (map: IDictionary<any>, one: ProfiloConfigurationItem) => {
                map[one.key] = one;
                return map;
            }, {});
            return protectionMap;
        }
        return {};
    }

    private checkKey(protectionMap: IDictionary<ProfiloConfigurationItem>, key: string): boolean {
        if (has(protectionMap, key)) {
            let protValue: ProfiloConfigurationItem = get(protectionMap, key);
            return protValue.valore;
        }
        return undefined;
    }

    // #region Getters

    private get provider(): SdkProviderService { return this.injectable(SdkProviderService) }

    // #endregion
}