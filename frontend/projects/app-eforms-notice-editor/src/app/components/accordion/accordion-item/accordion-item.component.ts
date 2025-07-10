import { Component, EventEmitter, inject, Input, OnChanges, Output } from '@angular/core';
import { GR_LOT_ID } from '../../../app.constants';
import { AccordionItem, AccordionOutput } from '../../../models/app.model';
import { FormService } from '../../../services/form.service';

@Component({
  selector: 'app-accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss']
})
export class AccordionItemComponent implements OnChanges {
  private _formService: FormService = inject(FormService);
  @Input() public id: string = '';
  @Input() public title: string = '';
  @Input() public index: string;
  @Input() public key: string = '';
  @Input() public items: Array<AccordionItem> = null;
  @Input() public lastLevel: boolean = false;
  @Output('itemClick') public itemClick$: EventEmitter<AccordionOutput> = new EventEmitter<AccordionOutput>();
  @Output('addElement') public addElement$: EventEmitter<string> = new EventEmitter<string>();
  @Output('removeElement')
  public removeElement$: EventEmitter<AccordionOutput> = new EventEmitter<AccordionOutput>();

  public isExpanded: boolean = false;

  public ngOnChanges(): void {
    if (!this.items) {
      this.isExpanded = false;
    }

    if (this._formService.itemsExpandedForSideMenu) {
      let found = false;
      this._formService.itemsExpandedForSideMenu.forEach((item) => {
        if (item.id == this.id && item.expanded == true) {
          found = true;
        }
      });
      if (found) {
        this.isExpanded = true;
      } else {
        this.isExpanded = false;
      }
    }
  }

  public onTitleClick(): void {
    if (this.items != null) {
      if (this.id == GR_LOT_ID) {
        let obj: AccordionOutput = {
          id: this.id,
          label: this.title,
          index: this.index,
          isLastClicked: true,
          key: this.key
        };
        this.itemClick$.emit(obj);
      } else {
        if (this.isExpanded) {
          this._formService.itemsExpandedForSideMenu = this._formService.itemsExpandedForSideMenu.filter((item) => {
            if (!(item.id == this.id && item.expanded == true)) {
              return item;
            }
          });
        } else {
          this._formService.itemsExpandedForSideMenu.push({ id: this.id, expanded: true, key: this.key });
        }

        this.isExpanded = !this.isExpanded;
      }
    } else {
      let obj: AccordionOutput = {
        id: this.id,
        label: this.title,
        index: this.index,
        isLastClicked: true,
        key: this.key
      };
      this.itemClick$.emit(obj);
    }
  }

  public manageItemClick(obj: AccordionOutput): void {
    this.itemClick$.emit(obj);
  }

  /**
   * Evento lanciato dal pulsante "Aggiungi"
   * @param _event
   */
  public manageAddElementButtonClick(_event: any): void {
    // this._formService.itemsExpandedForSideMenu.push({ id: this.id, expanded: true });
    this.addElement$.emit(this.id);
  }

  /**
   * Evento lanciato dall'emitter del figlio
   * @param id id dell'elemento da aggiungere
   */
  public manageAddElementEvent(id: string): void {
    // this._formService.itemsExpandedForSideMenu.push({ id: this.id, expanded: true });
    this.addElement$.emit(id);
  }

  /**
   * Evento di click del bidoncino
   */
  public deleteElement(): void {
    let obj: AccordionOutput = {
      id: this.id,
      index: this.index
    };
    this.removeElement$.emit(obj);
  }

  /**
   * Evento lanciato dall'emitter del figlio
   * @param obj oggetto contenente l'id dell'elemento da eliminare e l'indice
   */
  public manageRemoveElementEvent(obj: AccordionOutput): void {
    this.removeElement$.emit(obj);
  }
}
