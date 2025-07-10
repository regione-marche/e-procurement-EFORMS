import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { every, isEmpty, isObject, join, keys, set } from 'lodash-es';
import { Observable, Observer, of } from 'rxjs';

import {
  SdkDocumentConfig,
  SdkDocumentInput,
  SdkDocumentOutput,
  SdkSwitchConfig,
  SdkSwitchInput,
  SdkTextboxConfig,
  SdkTextboxInput,
  SdkTextboxOutput,
} from '../../sdk-form.domain';
import { SdkAbstractFormField } from '../abstract/sdk-abstract-form-field.component';
import { SdkDocumentUtils } from './sdk-document.utils';

/**
 * Componente per renderizzare una form di caricamento file
 * Un campo di input (URL), un file input e un checkbox per mostrarne uno anziche' l'altro
 */
@Component({
  selector: 'sdk-document',
  templateUrl: './sdk-document.component.html',
  styleUrls: ['./sdk-document.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkDocumentComponent extends SdkAbstractFormField<SdkDocumentConfig, SdkDocumentInput, SdkDocumentOutput> implements OnInit, AfterViewInit, OnDestroy {

  // #region Variables

  /**
   * @ignore
   */
  public config: SdkDocumentConfig;
  /**
   * @ignore
   */
  public data: SdkDocumentInput;

  /**
   * @ignore
   */
  private switchConfiguration: SdkSwitchConfig;
  /**
   * @ignore
   */
  private switchInput: SdkSwitchInput;
  /**
   * @ignore
   */
  public switchConfigurationObs: Observable<SdkSwitchConfig>;
  /**
   * @ignore
   */
  public switchInputObs: Observable<SdkSwitchInput>;
  /**
   * @ignore
   */
  public switchFileLabel: string;
  /**
   * @ignore
   */
  public switchUrlLabel: string;
  /**
   * @ignore
   */
  public withTitle: boolean = true;

  /**
   * @ignore
   */
  private titleConfiguration: SdkTextboxConfig;
  /**
   * @ignore
   */
  private titleInput: SdkTextboxInput;
  /**
   * @ignore
   */
  public titleConfigurationObs: Observable<SdkTextboxConfig>;
  /**
   * @ignore
   */
  public titleInputObs: Observable<SdkTextboxInput>;

  /**
   * Url = false, File = true
   * @ignore
   */
  public fileSwitch: boolean = false;

  /**
   * @ignore
   */
  private urlConfig: SdkTextboxConfig;
  /**
   * @ignore
   */
  public urlConfigObs: Observable<SdkTextboxConfig>;
  /**
   * @ignore
   */
  private urlInput: SdkTextboxInput;
  /**
   * @ignore
   */
  public urlInputObs: Observable<SdkTextboxInput>;

  /**
   * @ignore
   */
  public fileInputLabel: string;
  /**
   * @ignore
   */
  public fileInputLabelParams: IDictionary<string>;
  /**
   * @ignore
   */
  public maxFileSize: string = '-1 MB';

  /**
   * @ignore
   */
  private documentOutput: SdkDocumentOutput;

  /**
   * @ignore
   */
  public messagesMap: IDictionary<Array<string>>;

  /**
   * @ignore
   */
  public messagesLevels: Array<string>;

  /**
   * @ignore
   */
  public malformedMaxSize: boolean = false;

  // #endregion

  // #region Constructor

  /**
   * @ignore
   */
  constructor(inj: Injector, cdr: ChangeDetectorRef) { super(inj, cdr) }

  // #endregion

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

  // #endregion

  // #region Config

  /**
   * @ignore
   */
  protected onOutput(_data: SdkDocumentOutput): void { }

  /**
   * @ignore
   */
  protected onConfig(config: SdkDocumentConfig): void {
    this.config = config;
    if (isObject(this.config)) {
      this.switchConfiguration = {
        code: this.config.code + '-switch',
        offLabel: ' ',
        onLabel: ' '
      };
      this.switchConfigurationObs = of(this.switchConfiguration);
      this.switchUrlLabel = this.config.switchUrlLabel;
      this.switchFileLabel = this.config.switchFileLabel;
      this.withTitle = this.config.withTitle ?? true;
      this.urlConfig = {
        code: this.config.code + '-url',
        label: this.config.urlLabel,
        labelParams: this.config.urlLabelParams
      };
      this.urlConfigObs = of(this.urlConfig);
      this.documentOutput = {
        code: this.config.code,
        valid: this.config.mandatory === true ? false : true,
        fileSwitch: false
      };

      this.emitOutput(this.documentOutput);

      this.fileInputLabel = this.config.fileInputLabel;
      this.fileInputLabelParams = this.config.fileInputLabelParams;
      if (!isEmpty(this.config.maxFileSize)) {
        this.maxFileSize = this.config.maxFileSize;
        this.malformedMaxSize = SdkDocumentUtils.checkMalformedMaxFileSize(this.maxFileSize);
      }

      this.titleConfiguration = {
        code: this.config.code + '-title',
        label: this.config.titleInputLabel,
        labelParams: this.config.titleInputLabelParams
      };
      if (this.config.maxTitleLength != null) {
        this.titleConfiguration.maxLength = this.config.maxTitleLength;
      }
      this.titleConfigurationObs = of(this.titleConfiguration);
    }
    this.isReady = true;
  }

  /**
   * @ignore
   */
  protected onData(data: SdkDocumentInput): void {
    this.manageFileSelect(() => {
      this.data = data;
      if (isObject(this.data)) {
        this.switchInput = {
          checked: this.data.fileSwitch ? this.data.fileSwitch : false
        };
        this.switchInputObs = of(this.switchInput);
        this.fileSwitch = this.data.fileSwitch ? this.data.fileSwitch : false;

        this.urlInput = {
          data: this.data.url
        };
        this.urlInputObs = new Observable((ob: Observer<SdkTextboxInput>) => {
          ob.next(this.urlInput);
          ob.complete();
        });

        this.titleInput = {
          data: data.title
        };
        this.titleInputObs = of(this.titleInput);

        this.documentOutput = {
          ...this.documentOutput,
          valid: this.config.mandatory === true ? !isEmpty(data.title) && (!isEmpty(data.url) || !isEmpty(this.documentOutput.file)) : true,
          fileSwitch: this.fileSwitch
        };
        this.emitOutput(this.documentOutput);
      }
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
  public manageSwitchChange(file: boolean): void {
    this.markForCheck(() => {
      this.documentOutput.fileSwitch = file === true;
      this.fileSwitch = file === true;
      if (this.fileSwitch === true) {
        if (isObject(this.documentOutput)) {
          delete this.documentOutput.url;
        }
        if (isObject(this.urlInput)) {
          delete this.urlInput.data;
        }
      }
      // this.checkMandatory();
      this.emitOutput(this.documentOutput);
    });
  }

  /**
   * @ignore
   */
  public manageUrlChange(data: SdkTextboxOutput): void {
    if (isObject(this.urlInput)) {
      this.urlInput.data = data.data;
    }
    this.documentOutput.url = data.data;
    // this.checkMandatory();
    this.emitOutput(this.documentOutput);
  }

  /**
   * @ignore
   */
  public manageFileSelect(event: any): void {
    this.clearFile();
    this.clearMessageMap();
    let target: HTMLInputElement = event.target;
    if (isObject(target)) {
      let files: FileList = target.files;
      let file: File = files.item(0);

      if (!isEmpty(files) && isObject(file)) {
        if (SdkDocumentUtils.checkMaxFileSize(file, this.maxFileSize)) {
          if (SdkDocumentUtils.checkFileExtension(file, this.config.accept)) {
            let currentExtension: string = undefined;
            if (file.name.indexOf('') > -1) {
              currentExtension = file.name.split('.').pop();
            }
            this.documentOutput = {
              ...this.documentOutput,
              fileName: file.name,
              tipoFile: currentExtension
            };
            let reader = new FileReader();
            reader.onload = this.handleReaderLoaded;
            reader.readAsBinaryString(file);
          } else {
            this.clearMessageMap();
            this.markForCheck(() => {
              set(this.messagesMap, 'error', [
                {
                  text: this.config.wrongExtensionLabel,
                  params: {
                    name: file.name
                  }
                }
              ]);
              this.messagesLevels = keys(this.messagesMap);
            });
          }
        } else {
          this.clearMessageMap();
          this.markForCheck(() => {
            set(this.messagesMap, 'error', [
              {
                text: this.config.maxFileSizeLabel,
                params: {
                  name: file.name,
                  size: this.maxFileSize
                }
              }
            ]);
            this.messagesLevels = keys(this.messagesMap);
          });
        }
      }
    }
  }

  /**
   * @ignore
   */
  public manageTitleChange(data: SdkTextboxOutput): void {
    if (isObject(this.titleInput)) {
      this.titleInput.data = data.data;
    }
    this.documentOutput.title = data.data;
    // this.checkMandatory();
    this.emitOutput(this.documentOutput);
  }

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
  public handleInfoBoxDblClick(_event: Event): void {
    if (this.config.infoBox === true) {
      this.outputInfoBox$.emit(this.config);
    }
  }

  // #endregion

  // #region Private

  /**
   * @ignore
   */
  private checkMandatory(): void {
    if (this.config.mandatory === true) {
      this.clearMessageMap();
      let valids: Array<boolean> = new Array();

      // check title
      valids.push(!isEmpty(this.documentOutput.title));

      // check switch
      if (this.documentOutput.fileSwitch === true) {
        valids.push(!isEmpty(this.documentOutput.file));
      } else {
        valids.push(!isEmpty(this.documentOutput.url));
      }

      let valid: boolean = every(valids, (one: boolean) => one === true);
      this.documentOutput.valid = valid;
      if (valid === false) {
        this.markForCheck(() => {
          set(this.messagesMap, 'error', [this.config.mandatoryLabel]);
          this.messagesLevels = keys(this.messagesMap);
        });
      }
    }
  }

  /**
   * @ignore
   */
  private clearMessageMap(): void {
    this.markForCheck(() => {
      this.messagesMap = {};
      this.messagesLevels = new Array();
    });
  }

  /**
   * @ignore
   */
  private handleReaderLoaded = (readerEvt: any) => {
    let binaryString = readerEvt.target.result;
    let base64String = btoa(binaryString);
    this.documentOutput.file = base64String;
    // this.checkMandatory();
    this.emitOutput(this.documentOutput);
  }

  /**
   * @ignore
   */
  private clearFile(): void {
    if (this.documentOutput != null) {
      this.documentOutput = {
        ...this.documentOutput,
        file: undefined,
        fileName: undefined,
        tipoFile: undefined
      };
    }
    this.emitOutput(this.documentOutput);
  }

  // #endregion

}
