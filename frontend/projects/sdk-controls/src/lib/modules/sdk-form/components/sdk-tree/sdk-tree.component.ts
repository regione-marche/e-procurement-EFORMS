import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { isObject } from 'lodash-es';
import { TreeNode } from 'primeng/api';

import { SdkTreeConfig, SdkTreeOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';

/**
 * Componente per renderizzare un tree
 */
@Component({
  selector: 'sdk-tree',
  templateUrl: './sdk-tree.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTreeComponent extends SdkAbstractFormField<SdkTreeConfig, void, SdkTreeOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkTreeConfig;

  /**
   * @ignore
   */
  public selectedValue: TreeNode;

  // #endregion

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

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
  protected onConfig(config: SdkTreeConfig): void {
    if (isObject(config)) {
      this.markForCheck(() => {
        this.config = config;
        this.selectedValue = config.selectedValue;

        this.isReady = true;
      });
    }
  }

  /**
   * @ignore
   */
  protected onData(_data: void): void { }

  /**
   * @ignore
   */
  protected onOutput(_output: SdkTreeOutput): void { }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public handleNodeClick(event: any): void {
    this.emitOutput({ code: this.config.code, item: event.node, path: undefined });
  }

  /**
   * @ignore
   */
  public treeOutput(event: any): void { }

  // #endregion

  // #region Private

  // #endregion
}
