import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  HostBinding,
  Injector,
  NgZone,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';
import { isEmpty, isObject, join } from 'lodash-es';

import { SdkTableViewRefDirective } from '../../../directives/sdk-table.view-ref.directive';
import { SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';

@Component({
  selector: 'sdk-table-cell-factory-viewer',
  templateUrl: 'sdk-table-cell-factory-viewer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class SdkTableCellFactoryViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

  @HostBinding('class') styles = 'sdk-table-row-cell sdk-table-cell-factory-viewer';

  @ViewChild(SdkTableViewRefDirective) viewRef: SdkTableViewRefDirective;

  private ref: ComponentRef<SdkTableCellViewer>;

  constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

  // #region Hooks

  public override ngOnInit(): void { super.ngOnInit() }

  public override ngOnDestroy(): void { super.ngOnDestroy() }

  public ngAfterViewInit(): void { this.initCellViewer() }

  // #endregion

  // #region Protected

  protected override updateData(): void { if (this.ref) { this.ref.instance.dataItem = this.dataItem } }

  protected onColumnConfigChange(): void { this.addStyles() }

  protected onDataItemChange(): void { }

  // #endregion

  // #region Private

  private initCellViewer(): void {

    this.cell.clear();

    this.ref = this.component();

    // Push components inputs
    this.ref.instance.dataItem = this.dataItem;
    this.ref.instance.rowIndex = this.rowIndex;
    this.ref.instance.columnConfig = this.columnConfig;
    this.ref.instance.params = this.columnConfig.viewer.params;

    // Subscribe components events
    this.subscriptions.push(
      this.ref.instance.events.subscribe((event: any) => {
        if (isObject(this.events)) { this.events.emit(event) }
      })
    );

    // Trigger Change Detection
    this.cdr.detectChanges();

  }

  private component(): ComponentRef<SdkTableCellViewer> {
    return this.cell.createComponent(
      this.columnConfig.viewer.type
    );
  }

  private addStyles(): void {
    if (isObject(this.columnConfig) === true) {
      if (isObject(this.columnConfig.viewer) === true) {
        if (isEmpty(this.columnConfig.viewer.styles) === false) {
          this.styles += ' ' + join(this.columnConfig.viewer.styles, ' ');
        }
      }
    }
  }

  // #endregion

  // #region Getters

  private get cell(): ViewContainerRef { return this.viewRef.viewContainerRef }

  // #endregion

}


