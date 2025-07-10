import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Injector,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { get, has, isEmpty, isObject, join } from 'lodash-es';
import { Observable, of, Subject } from 'rxjs';

import { SdkBasicButtonInput, SdkBasicButtonOutput } from '../../../sdk-button/sdk-button.domain';
import { SdkModalConfig } from '../../../sdk-modal/sdk-modal.domain';
import { SdkTextConfig, SdkTextInput, SdkTextModalConfig, SdkTextModalOutput } from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';

/**
 * Componente per renderizzare un testo semplice
 */
@Component({
  selector: 'sdk-textmodal',
  templateUrl: './sdk-textmodal.component.html',
  styleUrls: ['./sdk-textmodal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkTextModalComponent extends SdkAbstractFormField<SdkTextConfig, SdkTextInput, SdkTextModalOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  @Output('outputClick') outputClick$: EventEmitter<any> = new EventEmitter();

  /**
   * @ignore
   */
  public config: SdkTextModalConfig;
  /**
   * @ignore
   */
  public data: string;

  /**
   * @ignore
   */
  public showCleanButton: boolean = false;

  /**
   * @ignore
   */
  public infoModalButtonConfigObs: Observable<SdkBasicButtonInput>;

  /**
   * @ignore
   */
  public cleanModalButtonConfigObs: Observable<SdkBasicButtonInput>;

  /**
   * @ignore
   */
  private modalConfig: SdkModalConfig<any, void, any>;
  /**
   * @ignore
   */
  public modalConfigObs: Subject<SdkModalConfig<any, void, any>> = new Subject();

  /**
   * @ignore
   */
  public selectedItem: any;

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
  protected onOutput(_data: SdkTextModalOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkTextModalConfig): void {
    this.config = config;
    if (isObject(this.config)) {
      this.data = this.config.data;
      let disabled: boolean = false
      if (has(config, 'clean')) {
        disabled = !(get(config, 'clean'));
      }

      this.infoModalButtonConfigObs = of({
        code: 'info',
        label: '',
        title: 'BUTTONS.UPDATE',
        icon: 'mgg-icons-crud-edit'
      });
      this.cleanModalButtonConfigObs = of({
        code: 'clean',
        label: '',
        disabled: disabled,
        title: 'BUTTONS.CLOSE',
        icon: 'mgg-icons-crud-cancel'
      });


      this.modalConfig = {
        code: 'modal',
        title: 'titolo modale',
        openSubject: new Subject(),
        component: this.config.modalComponent,
        componentConfig: this.config.modalComponentConfig,
        width: 70
      };
      this.modalConfigObs.next(this.modalConfig);
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkTextInput): void {
    this.markForCheck(() => {
      this.data = data.data;
      this.emitOutput(
        {
          code: this.config.code,
          mnemonico: this.config.mnemonico,
          oggettoProtezione: this.config.oggettoProtezione,
          data: this.data,
          clicked: false,
          modalComponent: this.config.modalComponent,
          modalComponentConfig: this.config.modalComponentConfig
        } as SdkTextModalOutput
      );

      this.showCleanButton = true;
    });
  }

  /**
   * @ignore
   */
  protected onUpdateState(state: boolean): void { }

  // #endregion

  // #region Public

  /**
   * @ignore
   */
  public getClasses(initialLabel: string, additionalClasses: Array<string>, infoBox?: boolean): string {
    let classes: Array<string> = [initialLabel];
    if (!isEmpty(additionalClasses)) {
      classes = [...classes, ...additionalClasses];
    }
    if (infoBox === true) {
      classes.push('info-box-available');
    }
    return join(classes, ' ');
  }

  /**
   * @ignore
   */
  public getValueClasses(initialLabel: string, config: SdkTextConfig, infoBox?: boolean): string {
    let classes: Array<string> = [initialLabel];
    if (isObject(config) && config.link === true) {
      classes = [...classes, 'clickable'];
    }
    if (infoBox === true) {
      classes.push('info-box-available');
    }
    return join(classes, ' ');
  }

  /**
  * @ignore
  */
  public manageButtonClick(_button: SdkBasicButtonOutput): void {
    if (_button.code === 'info') {
      let componentConfig = {
        ...this.config.modalComponentConfig
      }
      if (!isEmpty(this.data)) {
        componentConfig.selectedItem = this.data;
      }
      this.modalConfig = {
        ...this.modalConfig,
        componentConfig: componentConfig,
      };
      this.modalConfigObs.next(this.modalConfig);
      this.modalConfig.openSubject.next(true);
    } else {
      this.data = undefined;
      this.showCleanButton = false;
      this.emitOutput(
        {
          code: this.config.code,
          mnemonico: this.config.mnemonico,
          oggettoProtezione: this.config.oggettoProtezione,
          data: this.data,
          clicked: false,
          modalComponent: this.config.modalComponent,
          modalComponentConfig: this.config.modalComponentConfig,
          modalContent: undefined,
          clear: true
        } as SdkTextModalOutput
      );
    }
  }

  /**
  * @ignore
  */
  public manageModalOutput(object: any): void {
    if (isObject(object) && isObject(get(object, 'data'))) {
      this.data = get(object, 'data.value');
      this.showCleanButton = true;

      this.emitOutput(
        {
          code: this.config.code,
          mnemonico: this.config.mnemonico,
          oggettoProtezione: this.config.oggettoProtezione,
          data: this.data,
          clicked: false,
          modalComponent: this.config.modalComponent,
          modalComponentConfig: this.config.modalComponentConfig,
          modalContent: get(object, 'data.item')
        } as SdkTextModalOutput
      );
    }
  }

  /**
   * @ignore
   */
  public handleInfoBoxDblClick(_event: Event): void {
    if (this.config.infoBox === true) {
      this.outputInfoBox$.emit(this.config);
    }
  }

  // #endregion
}
