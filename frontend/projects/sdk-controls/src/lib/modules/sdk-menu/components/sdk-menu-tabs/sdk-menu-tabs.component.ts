import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, find, isEmpty, isObject, isUndefined, size } from 'lodash-es';
import { MenuItem } from 'primeng/api';

import { SdkMenuTab, SdkMenuTabsConfig, SdkMenuTabsOutput } from '../../sdk-menu.domain';


/**
 * Componente per renderizzare un menu tabs
 */
@Component({
  selector: 'sdk-menu-tabs',
  templateUrl: './sdk-menu-tabs.component.html',
  styleUrls: ['./sdk-menu-tabs.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkMenuTabsComponent extends SdkAbstractComponent<SdkMenuTabsConfig, void, SdkMenuTabsOutput> implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  public config: SdkMenuTabsConfig;
  /**
   * @ignore
   */
  public menuItems: Array<MenuItem>;

  /**
   * @ignore
   */
  public childrenMenuItems: Array<MenuItem>;

  /**
   * @ignore
   */
  public activeItem: MenuItem;

  /**
   * @ignore
   */
  public childActiveItem: MenuItem;

  /**
   * @ignore
   */
  public hasChildren: boolean = false;

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  /**
   * @ignore
   */
  protected onInit(): void { }

  /**
   * @ignore
   */
  protected onAfterViewInit(): void { }

  /**
   * @ignore
   */
  protected onDestroy(): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkMenuTabsConfig): void {
    this.markForCheck(() => {
      if (isObject(config)) {
        this.menuItems = new Array();
        this.config = this.build(config);
      }
    });
  }

  /**
   * @ignore
   */
  protected onData(_data: void): void { }

  /**
   * @ignore
   */
  protected onOutput(data: SdkMenuTabsOutput): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #region Private

  /**
   * @ignore
   */
  private build(config: SdkMenuTabsConfig): SdkMenuTabsConfig {
    if (isUndefined(this.menuItems)) {
      this.menuItems = new Array();
    }

    each(config.tabs, (tab: SdkMenuTab, index: number) => {
      if (!isEmpty(tab.title)) {
        tab.title = this.translate.instant(tab.title);
      }

      let menuItem: MenuItem = {
        id: tab.code,
        disabled: tab.disabled === true,
        label: tab.title
      };

      if (tab.active) {
        this.activeItem = menuItem;
        if (tab.children != null) {
          this.hasChildren = false;
          delete this.childrenMenuItems;
          delete this.childActiveItem;
          this.hasChildren = true;
          this.buildChildren(tab);
        }
      }

      menuItem.command = this.onTabSelectFactory({ ...menuItem });
      this.menuItems.push(menuItem);
    });

    // se ho piu' di un tab allora li mostro
    this.isReady = size(this.menuItems) > 0;

    return config;
  }

  /**
   * @ignore
   */
  private onTabSelectFactory = (menuItem: MenuItem) => {
    return () => {
      this.onTabSelect(menuItem);
    }
  }

  /**
   * @ignore
   */
  private buildChildren(father: SdkMenuTab): void {
    if (this.childrenMenuItems == null) {
      this.childrenMenuItems = new Array();
    }

    each(father.children, (tab: SdkMenuTab, index: number) => {
      if (!isEmpty(tab.title)) {
        tab.title = this.translate.instant(tab.title);
      }

      let menuItem: MenuItem = {
        id: tab.code,
        disabled: tab.disabled === true,
        label: tab.title
      };

      if (tab.active || index === 0) {
        this.childActiveItem = menuItem;
      }

      menuItem.command = this.onTabSelectFactory({ ...menuItem });
      this.childrenMenuItems.push(menuItem);
    });
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public onTabSelect(menuItem: MenuItem): void {
    if (isObject(menuItem)) {
      let id: string = menuItem.id;
      let elem: SdkMenuTab = find(this.config.tabs, (one: SdkMenuTab) => one.code === id);
      let isChild: boolean = false;
      if (elem == null) {
        // cerco nei figli
        each(this.config.tabs, (one: SdkMenuTab) => {
          if (one.children != null) {
            const found: SdkMenuTab = find(one.children, (child: SdkMenuTab) => child.code === id);
            if (found != null) {
              elem = found;
              isChild = true;
              return false;
            }
          }
        });
      }

      if (isChild === false) {
        this.hasChildren = false;
        delete this.childrenMenuItems;
      }

      if (elem.children != null && elem.children.length > 0) {
        this.hasChildren = true;
        this.buildChildren(elem);
        this.onTabSelect({ ...this.childrenMenuItems[0] });
      } else {
        let obj: SdkMenuTabsOutput = { item: elem };
        this.emitOutput(obj);
      }
    }
  }

  // #endregion

  // #region Getters

  /**
   * @ignore
   */
  private get translate(): TranslateService { return this.injectable(TranslateService) }

  // #endregion

}
