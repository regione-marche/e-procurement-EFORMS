import { animate, state, style, transition, trigger } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { SdkAbstractComponent } from '@maggioli/sdk-commons';
import { TranslateService } from '@ngx-translate/core';
import { isEmpty, isObject, join } from 'lodash-es';
import { Observable, of } from 'rxjs';

import { SdkBasicButtonInput, SdkBasicButtonOutput } from '../../../sdk-button/sdk-button.domain';
import { SdkPanelbarItem, SdkPanelbarOutput } from '../../sdk-panelbar.domain';

/**
 * Componente per renderizzare un tab di un accordion
 */
@Component({
  selector: 'sdk-panelbar-tab',
  templateUrl: './sdk-panelbar-tab.component.html',
  styleUrls: ['./sdk-panelbar-tab.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('tabContent', [
      state('hidden', style({
        height: '0'
      })),
      state('visible', style({
        height: '*'
      })),
      transition('visible <=> hidden', animate('{{transitionParams}}'))
    ])
  ]
})
export class SdkPanelbarTabComponent extends SdkAbstractComponent<SdkPanelbarItem, void, SdkPanelbarOutput> implements OnInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkPanelbarItem;
  /**
   * @ignore
   */
  @Input() public index: number;
  /**
   * @ignore
   */
  @Input() public nuovoButtonConfig: SdkBasicButtonInput;
  /**
   * @ignore
   */
  @Input() public eliminaButtonConfig: SdkBasicButtonInput;
  /**
   * @ignore
   */
  @Output() public selectedChange: EventEmitter<any> = new EventEmitter();
  /**
   * @ignore
   */
  @Output() public onClose: EventEmitter<any> = new EventEmitter();
  /**
   * @ignore
   */
  @Output() public onOpen: EventEmitter<any> = new EventEmitter();

  /**
   * @ignore
   */
  public transitionOptions: string = '400ms cubic-bezier(0.86, 0, 0.07, 1)';
  /**
   * @ignore
   */
  public animating: boolean;
  /**
   * @ignore
   */
  public id: string;
  /**
   * @ignore
   */
  public loaded: boolean;
  /**
   * @ignore
   */
  public expandIcon: string = 'mgg-icons-paginator-next';
  /**
   * @ignore
   */
  public collapseIcon: string = 'mgg-icons-navigation-show';

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
  protected onOutput(_data: SdkPanelbarOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkPanelbarItem): void {
    this.markForCheck(() => {
      this.config = config;
      this.id = `accordiontab-${this.config.code}`;
    });
  }

  /**
   * @ignore
   */
  protected onData(_data: void): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public toggle(event: any): boolean {
    if (this.config.disabled || this.animating) {
      return false;
    }

    this.animating = true;
    let index = this.index;

    if (this.config.selected) {
      this.config.selected = false;
      this.onClose.emit({ originalEvent: event, index: index });
    } else {
      this.config.selected = true;
      this.loaded = true;
      this.onOpen.emit({ originalEvent: event, index: index });
    }

    this.selectedChange.emit(this.config.selected);
    event.preventDefault();
  }

  /**
   * @ignore
   */
  public onToggleDone(event: Event): void {
    this.animating = false;
  }

  /**
   * @ignore
   */
  public getIcon(item: SdkPanelbarItem): string {
    if (item.icon) {
      return `panelbar-icon ${item.icon}`;
    }
    return 'panelbar-icon';
  }

  /**
   * @ignore
   */
  public getHeaderClass(item: SdkPanelbarItem): string {

    let classes: Array<string> = ['text-normal'];

    if (isObject(item) && !isEmpty(item.cssClass)) {
      classes.push(item.cssClass)
    }

    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public manageAccordionClick(item: SdkPanelbarItem): void {
    if (isEmpty(item.children)) {
      let obj: SdkPanelbarOutput = {
        item,
        action: 'OPEN'
      };
      this.emitOutput(obj);
    }
  }

  /**
   * @ignore
   */
  public getNuovoButtonObs(buttonConfig: SdkBasicButtonInput): Observable<SdkBasicButtonInput> {
    return of(buttonConfig);
  }

  /**
   * @ignore
   */
  public manageNuovoButtonClick(_button: SdkBasicButtonOutput): void {
    const obj: SdkPanelbarOutput = {
      item: this.config,
      action: 'NEW'
    };
    this.emitOutput(obj);
  }

  /**
   * @ignore
   */
  public getEliminaButtonObs(buttonConfig: SdkBasicButtonInput): Observable<SdkBasicButtonInput> {
    return of(buttonConfig);
  }

  /**
   * @ignore
   */
  public manageEliminaButtonClick(_button: SdkBasicButtonOutput, item: SdkPanelbarItem): void {
    const obj: SdkPanelbarOutput = {
      item,
      action: 'DELETE'
    };
    this.emitOutput(obj);
  }

  // #endregion

}
