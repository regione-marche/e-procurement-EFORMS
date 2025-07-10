import {
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	HostBinding,
	Injector,
	NgZone,
	ViewEncapsulation,
} from '@angular/core';
import { IDictionary, SdkDateHelper } from '@maggioli/sdk-commons';

import { SdkTableCellViewer } from '../../../domains/sdk-table.config.domain';
import { SdkAbstractCellViewer } from '../cell-abstract-viewer/sdk-table-abstract-cell-viewer.component';


@Component({
	templateUrl: 'sdk-table-cell-date-viewer.component.html',
	changeDetection: ChangeDetectionStrategy.OnPush,
	encapsulation: ViewEncapsulation.None
})

export class SdKTableCellDateViewerComponent extends SdkAbstractCellViewer implements SdkTableCellViewer {

	@HostBinding('class') styles = 'sdk-table-cell-date-viewer';

	public value: string;

	constructor(cdr: ChangeDetectorRef, zone: NgZone, inj: Injector) { super(cdr, zone, inj) }

	// #region Hooks

	public override ngOnInit(): void { super.ngOnInit(); this.initValue() }

	public override ngOnDestroy(): void { super.ngOnDestroy() }

	// #endregion

	public getFormat(params: IDictionary<any>): string {
		return params.format;
	}

	// #region Protected

	protected onColumnConfigChange(): void { }

	protected onDataItemChange(): void { this.initValue() }

	// #endregion

	// #region Private

	private initValue(): void {
		if (this.dataItem && this.columnConfig) {
			this.value = this.sdkDateHelper.format(this.dataItem[this.columnConfig.field], this.getFormat(this.params));
		}
	}

	// #endregion

	// #region Getters

	private get sdkDateHelper(): SdkDateHelper { return this.injectable(SdkDateHelper) };

	// #endregion

}