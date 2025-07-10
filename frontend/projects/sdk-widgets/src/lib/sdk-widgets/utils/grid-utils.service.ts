import { Injectable, Injector, Type } from '@angular/core';
import { IDictionary, SdkBaseService } from '@maggioli/sdk-commons';
import {
    SdkTableActionConfig,
    SdkTableCellActionsIconViewerComponent,
    SdkTableCellActionsViewerComponent,
    SdkTableCellBooleanViewerComponent,
    SdkTableCellButtonViewerComponent,
    SdkTableCellCurrencyViewerComponent,
    SdKTableCellDateViewerComponent,
    SdkTableCellDropdownActionsIconViewerComponent,
    SdkTableCellHierarchicalLinkViewerComponent,
    SdkTableCellIconViewerComponent,
    SdkTableCellLinkViewerComponent,
    SdkTableCellNumberViewerComponent,
    SdkTableCellStringViewerComponent,
    SdkTableCellViewer,
    SdkTableColumn,
    SdkTableConfig,
    SdkTableDatasource,
    SdkTableToolbarActionPerfomer,
} from '@maggioli/sdk-table';
import { each, filter, get, isBoolean, isEmpty, isObject, set } from 'lodash-es';

import { ProfiloConfiguration } from '../model/lib.model';
import { ProtectionUtilsService } from './protection-utils.service';

@Injectable()
export class GridUtilsService extends SdkBaseService {

    private viewTypeMap: IDictionary<Type<SdkTableCellViewer>>

    constructor(inj: Injector) {
        super(inj);
        this.initTypeMap();
    }

    /**
     * Metodo per parsare la configurazione della griglia da descrittore e sostituirci i datasource, performers e componenti di cella
     * @param grid Configurazione di griglia letta da descrittore
     * @param datasource Datasource creato in precedenza tramite factory
     * @param performers Lista dei performers per le celle azione
     * @param format Format della data
     * @returns Configurazione di griglia finale
     */
    public parseDescriptor(
        grid: SdkTableConfig,
        datasource: SdkTableDatasource,
        performers: IDictionary<SdkTableToolbarActionPerfomer>,
        format: string,
        profiloConfiguration: ProfiloConfiguration): SdkTableConfig {
        if (isObject(grid) && isObject(datasource)) {
            grid.datasource = datasource;
            grid = this.elaborateColumns(grid, performers, format, profiloConfiguration);
            return grid;
        }
        return undefined;
    }

    // #region Private

    private initTypeMap(): void {
        this.viewTypeMap = {
            SDK_GRID_VIEW_CELL_STRING: SdkTableCellStringViewerComponent,
            SDK_GRID_VIEW_CELL_NUMBER: SdkTableCellNumberViewerComponent,
            SDK_GRID_VIEW_CELL_BOOLEAN: SdkTableCellBooleanViewerComponent,
            SDK_GRID_VIEW_CELL_ACTIONS: SdkTableCellActionsViewerComponent,
            SDK_GRID_VIEW_CELL_BUTTON: SdkTableCellButtonViewerComponent,
            SDK_GRID_VIEW_CELL_DATE: SdKTableCellDateViewerComponent,
            SDK_GRID_VIEW_CELL_CURRENCY: SdkTableCellCurrencyViewerComponent,
            SDK_GRID_VIEW_CELL_LINK: SdkTableCellLinkViewerComponent,
            SDK_GRID_VIEW_CELL_HIERARCHICAL_LINK: SdkTableCellHierarchicalLinkViewerComponent,
            SDK_GRID_VIEW_CELL_ACTIONS_ICON: SdkTableCellActionsIconViewerComponent,
            SDK_GRID_VIEW_CELL_ICON: SdkTableCellIconViewerComponent,
            SDK_GRID_VIEW_CELL_DROPDOWN_ACTIONS_ICON: SdkTableCellDropdownActionsIconViewerComponent
        }
    }

    private elaborateColumns(
        grid: SdkTableConfig,
        performers: IDictionary<SdkTableToolbarActionPerfomer>,
        format: string,
        profiloConfiguration: ProfiloConfiguration): SdkTableConfig {
        grid.columns = filter(grid.columns, (one: SdkTableColumn) => {
            return this.protectionUtilsService.checkGridColumnProtection(one.oggettoProtezione, profiloConfiguration);
        });
        each(grid.columns, (one: SdkTableColumn) => {
            if (isObject(one.viewer)) {
                let type: string = one.viewer.type as any;
                let realType: Type<SdkTableCellViewer> = get(this.viewTypeMap, type);
                one.viewer.type = realType;
                if (type === 'SDK_GRID_VIEW_CELL_DATE') {
                    set(one.viewer, 'params', {});
                    set(one.viewer.params, 'format', format);
                }
                if (type === 'SDK_GRID_VIEW_CELL_ACTIONS' || type === 'SDK_GRID_VIEW_CELL_ACTIONS_ICON' || type === 'SDK_GRID_VIEW_CELL_DROPDOWN_ACTIONS_ICON') {
                    let params: IDictionary<any> = one.viewer.params;
                    params.actions = filter(params.actions, (one: SdkTableActionConfig) => {
                        return this.protectionUtilsService.checkGridActionProtection(one.oggettoProtezione, profiloConfiguration);
                    });

                    each(params.actions, (action: SdkTableActionConfig) => {
                        let performer: string = action.performer as any;
                        action.performer = get(performers, performer);

                        let hidden: string = action.hidden as any;
                        action.hidden = get(performers, hidden);
                    });
                }
                if (type === 'SDK_GRID_VIEW_CELL_LINK' || type === 'SDK_GRID_VIEW_CELL_HIERARCHICAL_LINK') {
                    let params: IDictionary<any> = one.viewer.params;
                    let action: SdkTableActionConfig = params.action;

                    let visibleProtection: boolean = true;

                    if (!isEmpty(action.oggettoProtezione)) {
                        visibleProtection = this.protectionUtilsService.checkGridLinkProtection(action.oggettoProtezione, profiloConfiguration, action.oggettoProtezioneType);
                    }

                    if (visibleProtection) {
                        let performer: string = action.performer as any;
                        action.performer = get(performers, performer);
                        let hidden: any = action.hidden as any;
                        if (hidden != null && isBoolean(hidden)) {
                            action.hidden = hidden;
                        } else {
                            action.hidden = get(performers, hidden);
                        }
                    } else {
                        one.viewer.type = get(this.viewTypeMap, 'SDK_GRID_VIEW_CELL_STRING');
                    }

                }
            }
        });
        return grid;
    }

    // #endregion

    // #region Getters

    private get protectionUtilsService(): ProtectionUtilsService { return this.injectable(ProtectionUtilsService) }

    // #endregion
}