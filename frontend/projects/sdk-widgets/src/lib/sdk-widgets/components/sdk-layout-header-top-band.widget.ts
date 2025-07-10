import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    Injector,
    OnDestroy,
    OnInit,
    ViewEncapsulation,
} from '@angular/core';
import {
    IDictionary,
    SdkAbstractWidget,
    SdkProviderService,
    SdkRouterService,
    SdkStoreService,
    SdkTestataProfileMessageService,
    UserProfile,
} from '@maggioli/sdk-commons';
import {
    SdkAdvancedSearchCategoryConfig,
    SdkAdvancedSearchConfig,
    SdkDropdownButtonData,
    SdkDropdownButtonInput,
    SdkDropdownButtonOutput,
    SdkMenuConfig,
    SdkMenuItem,
    SdkModalConfig,
    SdkOverlayPanelConfig,
    SdkSidebarConfig,
    SdkSidebarOutput,
    SdkSimpleSearchInput,
} from '@maggioli/sdk-controls';
import { cloneDeep, each, filter, get, isEmpty, isObject } from 'lodash-es';
import { BehaviorSubject, PartialObserver, Subject, Subscription, of } from 'rxjs';

import { SdkLayoutMenuHeaderUtilsService } from './sdk-layout-header-menu-utils.service';
import { SdkResponsiveMenuSidebarConfig } from './sdk-responsive-menu-sidebar.widget';

@Component({
    templateUrl: `sdk-layout-header-top-band.widget.html`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkLayoutHeaderTopBandWidget extends SdkAbstractWidget<any> implements OnInit, OnDestroy, AfterViewInit {

    public titolo: string;
    public url: string;
    private config: IDictionary<any>;

    constructor(inj: Injector, private cdr: ChangeDetectorRef) { super(inj, cdr) }

    // #region Hooks

    protected onInit(): void { this.init(); }

    protected onAfterViewInit(): void {
      
    }

    protected onDestroy(): void {
      
    }

    protected onConfig(config: IDictionary<any>): void {
        if (config != null) {                     
            this.config = cloneDeep(config);                    
        }
    }

    protected onUpdateState(state: boolean): void {
       
    }

    // #endregion

    // #region Public
       
    // #endregion

    // #region Private

    private init(): void {
        this.markForCheck(() => {
            this.isReady = true;
            this.titolo = this.config.titolo;
            this.url = this.config.url;
        });
    }
      
    // #endregion

    // #region Getters
       
    // #endregion

    // #region Setters

   

    // #endregion
}
