import { state, style, trigger } from '@angular/animations';
import {
  ChangeDetectorRef,
  Component,
  HostBinding,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { IDictionary, SdkAbstractWidget, SdkBreadcrumbsMessageService } from '@maggioli/sdk-commons';
import { SdkDialogConfig } from '@maggioli/sdk-controls';
import { SdkLayoutBreadcrumbsCollapseService } from '@maggioli/sdk-widgets';
import { TranslateService } from '@ngx-translate/core';
import { cloneDeep, remove } from 'lodash-es';
import { BehaviorSubject, combineLatest, Subject, take } from 'rxjs';
import { GR_LOT_ID } from '../../../app.constants';
import { AccordionEvent, AccordionItem, AccordionOutput } from '../../../models/app.model';
import { FormService } from '../../../services/form.service';
import { LayoutMenuTabsEventsService } from '../../../services/layout-menu-tabs-events.service';
import { LayoutMenuTabsMessageService } from '../../../services/layout-menu-tabs-message.service';

@Component({
  templateUrl: `layout-side-menu-tabs.widget.html`,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('tabsContent', [
      state(
        'hidden',
        style({
          display: 'none'
        })
      ),
      state(
        'visible',
        style({
          display: 'block'
        })
      )
      // ,
      // transition('visible <=> hidden', animate('{{transitionParams}}'))
    ])
  ]
})
export class LayoutSideMenuTabsWidget extends SdkAbstractWidget<any> implements OnInit, OnDestroy {
  @HostBinding('class') classNames = `layout-side-menu-tabs`;

  private _formService: FormService = inject(FormService);
  private _breadcrumbsCollapseService: SdkLayoutBreadcrumbsCollapseService = inject(
    SdkLayoutBreadcrumbsCollapseService
  );
  private _breadcrumbsService: SdkBreadcrumbsMessageService = inject(SdkBreadcrumbsMessageService);
  private _translateService: TranslateService = inject(TranslateService);
  private _layoutMenuTabsMessageService: LayoutMenuTabsMessageService = inject(LayoutMenuTabsMessageService);
  private _layoutMenuTabsEventsService: LayoutMenuTabsEventsService = inject(LayoutMenuTabsEventsService);

  private _deleteDialogConfig: SdkDialogConfig;

  public items: Array<AccordionItem>;
  public transitionOptions: string = '400ms cubic-bezier(0.86, 0, 0.07, 1)';
  public animating: boolean;
  public selected: boolean;
  public menuTitle: string;
  public currentAction: string;
  public deleteDialogConfigObs: BehaviorSubject<SdkDialogConfig> = new BehaviorSubject(null);

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #region Hooks

  protected onInit(): void {
    this.initAnimationState();
  }

  protected onAfterViewInit(): void {
    this.addSubscription(
      combineLatest({
        show: this._formService.showRequiredOrSuggestedOnly$,
        data: this._layoutMenuTabsMessageService.getObservable()
      }).subscribe(this.onData)
    );
    this.addSubscription(
      this._breadcrumbsCollapseService.sub((collapsed: boolean) => {
        setTimeout(() => this.toggle(collapsed));
      })
    );
  }

  protected onDestroy(): void {
    this.reset();
  }

  protected onConfig(_config: IDictionary<any>): void {
    this.initDialog();
  }

  protected onUpdateState(_state: boolean): void {}

  // #endregion

  // #region Private

  private initDialog(): void {
    this._deleteDialogConfig = {
      header: this._translateService.instant('DIALOG.DELETE-HEADER'),
      message: this._translateService.instant('DIALOG.DELETE-MESSAGE'),
      open: new Subject<Function>(),
      acceptLabel: this._translateService.instant('DIALOG.ACCEPT-LABEL'),
      rejectLabel: this._translateService.instant('DIALOG.REJECT-LABEL'),
      dialogId: 'delete-dialog'
    };
    this.deleteDialogConfigObs.next(this._deleteDialogConfig);
  }

  private onData = (result: IDictionary<any>) => {
    setTimeout(() => {
      let showRequiredOrSuggestedOnly: boolean = result.show;
      let values: Array<AccordionItem> = cloneDeep(result?.data);

      // EFORMS-65
      if (showRequiredOrSuggestedOnly) {
        remove(values, (one: AccordionItem) => one.id == 'GR-LotsGroup');
      }

      // isLastClicked messo a false per tutti ( SE TRUE, serve per mettere in grigio la parte del menu selezionata dall'utente)
      values.forEach((value) => {
        if (!value.items) {
          value.isLastClicked = false;
        } else {
          value.items.forEach((innerItem) => {
            innerItem.isLastClicked = false;
          });
        }
      });

      //metto a true isLastClicked in base al valore in breadcrumbs service.
      this._breadcrumbsService
        .getObservable()
        .pipe(take(1))
        .subscribe((lastClickedItem) => {
          let clickedLabel;
          if (lastClickedItem) {
            clickedLabel = lastClickedItem[0]?.label;
          }

          if (clickedLabel) {
            values.forEach((value) => {
              if (!value.items) {
                if (value.label == clickedLabel) {
                  value.isLastClicked = true;
                }
              } else {
                value.items.forEach((innerItem) => {
                  if (innerItem.label == clickedLabel) innerItem.isLastClicked = true;
                });
              }
            });
          }
        });

      this.items = values;
    });
  };

  private initAnimationState(): void {
    this.selected = !this._breadcrumbsCollapseService.collapseStatus;
  }

  private reset(): void {
    this.selected = true;
    this.animating = false;
    this._breadcrumbsCollapseService.expand();
    let event: AccordionEvent = {
      event: 'CLEAR'
    };
    this._layoutMenuTabsEventsService.emit(event);
  }

  // #endregion

  // #region Public

  public toggle(collapsed: boolean): boolean {
    if (this.animating) {
      return false;
    }

    this.animating = true;

    if (collapsed) {
      // chiudo tabs

      // verifico il caso in cui collapsed sia true
      // ma sono gia' nella situazione della sidebar collassata
      // Cio' non fa triggerare il metodo di termine dell'animazione pertanto lasciando la variabile
      // animating a true sempre...
      this.selected ? (this.selected = false) : (this.animating = false);
    } else {
      this.selected = true;
      this.animating = false;
    }
  }

  public onToggleDone(_event: Event): void {
    this.animating = false;
  }

  public manageFirstLevelItemToggle(output: AccordionOutput): void {
    this.items.forEach((item) => {
      if (item.items && item.id != GR_LOT_ID) {
        item.items.forEach((itemchild) => {
          if (itemchild.id == output.id && output.index == itemchild.index) {
            itemchild.isLastClicked = true;
          } else {
            itemchild.isLastClicked = false;
          }
        });
      } else if (item.id == output.id) {
        item.isLastClicked = true;
      } else {
        item.isLastClicked = false;
      }
    });

    let event: AccordionEvent = {
      event: 'TOGGLE',
      value: output
    };
    this._layoutMenuTabsEventsService.emit(event);
  }

  public manageAddElementEvent(id: string): void {
    let event: AccordionEvent = {
      event: 'ADD',
      value: id
    };
    this._layoutMenuTabsEventsService.emit(event);
    this._formService.setShouldShowAddandRemoveButtons(this._formService.shouldShow);
  }

  public manageRemoveElementEvent(output: AccordionOutput): void {
    this._deleteDialogConfig.open.next(() => {
      let event: AccordionEvent = {
        event: 'REMOVE',
        value: output
      };
      this._layoutMenuTabsEventsService.emit(event);
    });
  }

  // #endregion
}
