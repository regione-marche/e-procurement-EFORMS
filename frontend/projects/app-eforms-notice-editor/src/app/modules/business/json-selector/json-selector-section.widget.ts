import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  inject,
  Injector,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IDictionary,
  SdkBusinessAbstractWidget,
  SdkHttpLoaderService,
  SdkHttpLoaderType,
  SdkLocaleService,
  SdkRouterService
} from '@maggioli/sdk-commons';
import { cloneDeep, isEmpty } from 'lodash-es';
import { mergeMap, tap } from 'rxjs';
import { NoticeTypesDTO, ResponseResult } from '../../../models/api.model';
import { HomePageCard } from '../../../models/app.model';
import { ApiService } from '../../../services/api.service';
import { DataService } from '../../../services/data.service';

@Component({
  templateUrl: `json-selector-section.widget.html`,
  encapsulation: ViewEncapsulation.None
})
export class JsonOrXmlSelectorSectionWidget
  extends SdkBusinessAbstractWidget<void>
  implements OnInit, OnDestroy
{
  @HostBinding('class') classNames = `enotice-version-selector-section`;

  @ViewChild('messages') _messagesPanel: ElementRef;

  public config: any = {};
  public jsonCard: Array<HomePageCard> = new Array();

  private _dataService: DataService = inject(DataService);
  private _apiService: ApiService = inject(ApiService);
  private _sdkRouterService: SdkRouterService = inject(SdkRouterService);
  private _sdkLocaleService: SdkLocaleService = inject(SdkLocaleService);
  private _activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private _sdkHttpLoaderService: SdkHttpLoaderService = inject(SdkHttpLoaderService);
  private _action: string;
  private _sdkVersion: string;

  constructor(inj: Injector, cdr: ChangeDetectorRef) {
    super(inj, cdr);
  }

  // #region Hooks

  protected onInit(): void {
    this._dataService.reset();
    this._action = this._activatedRoute.snapshot.queryParamMap.get('action');

    if (this._action != 'EDIT') {
      this._sdkRouterService.navigateToPage('home-page');
    }

    this.loadCards();
  }

  protected onAfterViewInit(): void {}

  protected onDestroy(): void {}

  protected onConfig(config: any): void {
    if (config != null) {
      this.config = { ...config };
      this.isReady = true;
    }
  }

  protected onUpdateState(_state: boolean): void {}

  // #endregion

  // #region Public

  private loadCards(): void {
    this.markForCheck(() => {
      this.jsonCard = cloneDeep(this.config.jsonCard);
    });
  }

  public manageCardClick(): void {
    this.triggerFileInput();
    // this.loadNoticeTypes().pipe(tap(this.elaborateNoticeTypes));
  }

  private triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput.click();
  }

  private loadNoticeTypes = () => {
    return this._apiService.loadNoticeTypes(
      this._dataService.selectedSdkVersion
    );
  };

  private elaborateNoticeTypes = (response: ResponseResult<NoticeTypesDTO>) => {
    let data: NoticeTypesDTO = response.data;
    this._dataService.noticeTypes = data;
  };

  /**
   * Quando il file json viene selezionato, chiama un metodo per eseguire il parsing
   * @param event evento del click
   */
  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type === 'application/json') {
        const reader = new FileReader();
        reader.onload = () => {
          const fileContent = reader.result;
          this.parseJson(fileContent)
            .then(() => {
              this.performLoadSequence();
            })
            .catch((error) => {
              console.error('Error parsing JSON', error);
            });
        };
        reader.readAsText(file);
      } else {
        console.error('Invalid file type. Please upload a JSON file.');
      }
    }
  }

  /**
   * Una volta che il parsing è stato eseguito, naviga alla pagina di edit-enotice
   */
  private performLoadSequence(): void {
    if (this.jsonCard[0] && this.jsonCard[0].code) {
      this._sdkHttpLoaderService.showLoader(SdkHttpLoaderType.Operation);
      this.loadNoticeTypes()
        .pipe(
          tap(this.elaborateNoticeTypes),
          mergeMap(this.loadBasicMetadata),
          tap(this.elaborateBasicMetadata),
          mergeMap(this.loadTranslations),
          tap(this.elaborateTranslations)
        )
        .subscribe({
          next: () => {
            this._sdkHttpLoaderService.hideLoader();
            this.navigateToNextPage();
          },
          error: () => this._sdkHttpLoaderService.hideLoader()
        });
    }
  }

  /**
   * Esegue il parsing del contenuto del file json
   * @param fileContent file json
   */
  private parseJson(fileContent: any): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const jsonContent = JSON.parse(fileContent as string);
        this._sdkVersion = jsonContent.sdkVersion.toString();
        if (this._sdkVersion == 'eforms-sdk-1.12.0') {
          this._sdkVersion = '1.12';
        } else if (this._sdkVersion == 'eforms-sdk-1.9.4') {
          this._sdkVersion = '1.9';
        }
        this._dataService.selectedSdkVersion = this._sdkVersion;
        this._dataService.selectedNotice = jsonContent.noticeSubType.toString();
        this._dataService.uploadedJsonContent = jsonContent;

        resolve(jsonContent);
      } catch (error) {
        console.error('error parsing JSON', error);
        reject(error);
      }
    });
  }

  private loadBasicMetadata = () => {
    return this._apiService.loadBasicMetadata(
      this._dataService.selectedSdkVersion
    );
  };

  private elaborateBasicMetadata = (
    response: ResponseResult<IDictionary<any>>
  ) => {
    let data: IDictionary<any> = response.data;
    this._dataService.basicMetaData = data;
  };

  private loadTranslations = () => {
    this._dataService.selectedLang = this._sdkLocaleService.locale;
    return this._apiService.loadTranslations(
      this._dataService.selectedSdkVersion,
      this._dataService.selectedLang
    );
  };

  private elaborateTranslations = (
    response: ResponseResult<IDictionary<any>>
  ) => {
    let data: IDictionary<any> = response.data;
    this._dataService.translations = data;
  };

  /**
   * Naviga alla pagina di edit-enotice
   */
  private navigateToNextPage(): void {
    if (this.jsonCard != null) {
      if (!isEmpty(this.jsonCard[0].slug)) {
        let params: IDictionary<string> = { action: this._action };
        this.routerService.navigateToPage(this.jsonCard[0].slug, params);
      }
    }
  }

  public getIcons(card: HomePageCard): Array<string> {
    let classes: Array<string> = [];

    if (card != null && !isEmpty(card.icon)) {
      classes.push(card.icon);
    }

    return classes;
  }

  // #endregion

  // #region Private

  private get routerService(): SdkRouterService {
    return this.injectable(SdkRouterService);
  }

  // #endregion
}
