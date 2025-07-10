import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { each, isEmpty, isObject, isUndefined, join } from 'lodash-es';
import { MenuItem } from 'primeng/api';

import { SdkMenuConfig, SdkMenuItem, SdkMenuOutput } from '../../sdk-menu.domain';

/**
 * @ignore
 */
interface MenuItemExtended extends MenuItem {
  /**
   * @ignore
   */
  items?: Array<MenuItem>;
}

/**
 * Componente per renderizzare un menu'
 */
@Component({
  selector: 'sdk-menu',
  templateUrl: './sdk-menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkMenuComponent extends SdkAbstractComponent<SdkMenuConfig, void, SdkMenuOutput> implements OnInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkMenuConfig;
  /**
   * @ignore
   */
  public menuItems: Array<MenuItemExtended>;

  // #endregion

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef, private translate: TranslateService) { super(inj, cdr) }

  // #region Hooks

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
  protected onOutput(data: SdkMenuOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkMenuConfig): void {
    setTimeout(() => {
      this.markForCheck(() => {
        if (isObject(config)) {
          this.menuItems = new Array();
          this.config = this.build(config);
          this.isReady = true;
        }
      });
    });
  }

  /**
   * @ignore
   */
  protected onData(_data: any): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Provate

  /**
   * @ignore
   */
  private build(config: SdkMenuConfig): SdkMenuConfig {
    if (isUndefined(this.menuItems)) {
      this.menuItems = new Array();
    }
    each(config.items, (one: SdkMenuItem) => {

      let menuItem: MenuItemExtended = {
        id: one.code,
        disabled: one.disabled
      };

      if (config.disabled != null) {
        one.disabled = config.disabled === true;
        menuItem.disabled = config.disabled === true;
      }

      if (one.active === true) {
        if (one.cssClass != null) {
          const classes: string = join([one.cssClass, 'menu-item-active'], ' ');
          one.cssClass = classes;
        } else {
          one.cssClass = 'menu-item-active';
        }
      }

      one = this.buildLabelsItem(one, menuItem);
      menuItem.command = this.onClickFactory({ ...menuItem });
      this.menuItems.push(menuItem);
    });
    return config;
  }

  /**
   * @ignore
   */
  private buildLabelsItem(menuItem: SdkMenuItem, pmenuItem: MenuItemExtended): SdkMenuItem {

    if (isObject(menuItem) && !isEmpty(menuItem.label)) {
      menuItem.text = this.translate.instant(menuItem.label, menuItem.labelParams);
      pmenuItem.label = menuItem.text;
    }
    pmenuItem.styleClass = menuItem.cssClass;
    if (!isEmpty(menuItem.items)) {
      each(menuItem.items, (one: SdkMenuItem) => {

        if (isUndefined(pmenuItem.items)) {
          pmenuItem.items = new Array();
        }
        let pmenuChild: MenuItemExtended = {
          id: one.code,
          disabled: one.disabled
        };

        one = this.buildLabelsItem(one, pmenuChild);
        pmenuChild.command = this.onClickFactory({ ...pmenuChild });
        pmenuItem.items.push(pmenuChild);
      });
    }
    return menuItem;
  }

  /**
   * @ignore
   */
  private getMenuItem(item: SdkMenuItem, code: string): SdkMenuItem {
    let itemFound: SdkMenuItem;
    if (item.code === code) {
      return item;
    }
    if (!isEmpty(item.items)) {
      each(item.items, (one: SdkMenuItem) => {
        itemFound = this.getMenuItem(one, code);
        if (isObject(itemFound)) {
          return false;
        }
      });
    }
    return itemFound;
  }

  /**
   * @ignore
   */
  private onClick = (menuItem: MenuItem): void => {
    if (isObject(menuItem)) {
      let id: string = menuItem.id;
      let found: SdkMenuItem;
      each(this.config.items, (one: SdkMenuItem) => {
        if (one.code === id) {
          found = one;
          return false;
        }
        found = this.getMenuItem(one, id);
        if (isObject(found)) {
          return false;
        }
      });
      found = { ...found };
      if (isEmpty(found.items)) {
        let obj: SdkMenuOutput = {
          item: found
        };
        this.emitOutput(obj);
      }
    }
  }

  /**
   * @ignore
   */
  private onClickFactory = (menuItem: MenuItem): any => {
    return () => {
      this.onClick(menuItem);
    }
  }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public getClasses(initialLabel: string, config: SdkMenuConfig): string {
    let classes: Array<string> = [initialLabel];

    if (isObject(config) && config.tabs === true) {
      classes = [...classes, 'sdk-menu-tabs'];
    }

    return join(classes, ' ');
  }

  // #endregion

}
