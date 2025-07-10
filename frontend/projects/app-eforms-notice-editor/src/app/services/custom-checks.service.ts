import { inject, Injectable, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { cloneDeep } from 'lodash-es';
import { CvsItemDTO, CvsOutputDTO } from '../models/api.model';
import { AccordionOutput, CustomChecks, ExtendedFormControl, InvalidField } from '../models/app.model';
import { CryptoUtils } from '../utils/crypto-utils';
import { FormService } from './form.service';
import { ScrollService } from './formcontrol-scroll.service';

@Injectable({
  providedIn: 'root'
})
export class CheckService {
  private _formService: FormService = inject(FormService);
  private _scrollService: ScrollService = inject(ScrollService);
  private _checks: Array<Array<string>> = new Array<Array<string>>();
  private _koItem: CvsItemDTO = {
    index: 'KO',
    id: null,
    location: '*',
    numeroLotto: null,
    test: null,
    role: 'Error',
    text: 'text',
    legenda: null
  };

  public customChecks: Array<any> = [];
  public koItems: Array<CvsItemDTO> = [];

  public loadData(data: Array<Array<string>>) {
    if (data != null) {
      Object.keys(data as any).forEach((key) => {
        this._checks.push(data[key]);
      });
    }
  }

  /**
   * Metodo helper che guarda tutta la formReactiveContent e mi popola un Array customChecks con tante informazioni utili
   */
  private performCustomChecks(form: any, keys: number[], indexRep?: number, pathReactive?: string): void {
    if (form instanceof FormControl) {
      const parentFormGroup = form?.parent;
      const extendedForm = form as ExtendedFormControl<InvalidField>;

      // Check if customProperties is undefined or not initialized
      if (!extendedForm.customProperties) {
        extendedForm.customProperties = {
          invalid: signal(false)
        } as InvalidField;
      } else if (!extendedForm.customProperties.invalid) {
        extendedForm.customProperties.invalid = signal(false);
      }

      extendedForm.customProperties.invalid.set(false);

      // Find the key of this FormControl within its parent
      let controlKey = '';
      if (parentFormGroup) {
        Object.keys(parentFormGroup.controls).forEach((key) => {
          if (parentFormGroup.controls[key] === form) {
            controlKey = key;
          }
        });
      }

      //se controlkey è presente nell'array, allora lo metto in customChecks.
      this._checks.forEach((items) => {
        items.forEach((item) => {
          if (controlKey == item) {
            this.customChecks.push({
              controlKey, //id del form
              parentFormGroup, //formgroup O FormArray del parent
              form, // formcontrol
              keys,
              indexRep,
              pathReactive // path completo.
            });
          }
        });
      });
    } else if (form instanceof FormGroup) {
      Object.entries(form.controls).forEach(([key, control]) => {
        this.performCustomChecks(
          control,
          keys,
          indexRep,
          pathReactive ? pathReactive + '#' + key.toString() : key.toString()
        );
      });
    } else if (form instanceof FormArray) {
      form.controls.forEach((control: any, index: number) => {
        this.performCustomChecks(
          control,
          [...keys, index],
          indexRep,
          pathReactive ? pathReactive + '#' + index.toString() : index.toString()
        );
      });
    } else if (form instanceof Object) {
      Object.keys(form).forEach((key, index) => {
        this.performCustomChecks(form[key], keys, index, pathReactive ? pathReactive + '#' + key : key);
      });
    }
  }

  /**
   * Vedi EFORMS-72. La funzione aiuta l'utente dandogli una tabella di errore quando la validazione cvs non gestirebbe correttamente il caso.
   * @param form semplicemente la FormReactiveContent
   * @returns CustomChecks, mi permette di compilare la tabella cvs e di avere un bottone che una volta premuto mi porta alla parte errata
   */
  public findErrors(form): CustomChecks {
    this.performCustomChecks(form, []);
    let customChecksResult: CustomChecks = {
      cvsOutputDTO: null,
      passedChecks: true
    };
    let processedCustomChecks = [];

    // Group items by parent
    this.customChecks.forEach((check) => {
      if (check.parentFormGroup) {
        // Find an existing group for this parentFormGroup
        let existingGroup = processedCustomChecks.find((group) => group.parent === check.parentFormGroup);

        if (existingGroup) {
          // Add to the existing group's items
          let found = existingGroup.items.find((item) => {
            return item.controlKey === check.controlKey;
          });
          if (!found) {
            existingGroup.items.push(check);
          }
        } else {
          // Create a new group
          processedCustomChecks.push({
            parent: check.parentFormGroup,
            items: [check]
          });
        }
      }
    });

    //Fa essenzialmente uno "!XOR" sui valori del formControl (IN BASE AI SET DI CONTROLLI PRESI DA _CHECKS).
    //Se tutti i valori di un formGroup, ovvero tutti i formControl al suo interno (che sono stati segnati nell'array _checks),
    //sono TUTTI null o TUTTI vuoti allora è valido. è valido anche se sono TUTTI valorizzati.
    //Non è valido nel resto dei casi, quindi quando  la sezione è completata parzialmente.
    processedCustomChecks.forEach((formGroup) => {
      let allNull = true;
      let allPopulated = true;

      //AGGIUNTO IN EFORMS-90, possibleControls rappresenta tutti gli array di controllo possibili su un determinato formGroup
      let possibleControls = [];
      formGroup.items.forEach((formControl) => {
        this._checks.forEach((check) => {
          check.forEach((field) => {
            if (formControl.controlKey == field) {
              possibleControls.push(check);
            }
          });
        });
      });

      //Rimuovo i doppioni possibili
      possibleControls = [...new Set(possibleControls)];

      let atLeastOneSetOfControlsIsFullyPopulated = false;
      let allSetsOfControlsAreNull = true;

      //Per ogni possibile set di controlli di QUESTO formgroup...
      possibleControls.forEach((setOfControl) => {
        //se non abbiamo ancora trovato un set di controlli che sono popolati interamente...
        if (!atLeastOneSetOfControlsIsFullyPopulated) {
          //resetto i valori per questo set di controlli (Ricordo che potrebbero essere piu di uno da EFORMS-90)
          allNull = true;
          allPopulated = true;
          formGroup.items.forEach((formControl) => {
            setOfControl.forEach((field) => {
              //Questo if iniziale è importante perchè dato che raggruppo per formgroup, in alcuni casi,
              //potrebbe esserci un formgroup con dei campi che non devono essere controllati da questo set di controlli, ma da altri set in futuro.
              if (formControl.controlKey == field) {
                //queste variabili (allPopulated e allNull) si riferiscono ESCLUSIVAMENTE al CORRENTE set di controlli
                if (formControl.form.value == null || formControl.form.value == '') {
                  allPopulated = false;
                } else {
                  allNull = false;
                }
              }
            });
          });
        }
        //se questo set corrente era popolato, allora ho già finito
        atLeastOneSetOfControlsIsFullyPopulated = allPopulated;

        //questa variabile viene usata solamente alla fine, serve per sapere se TUTTI i set di controlli sono null,
        //Se sono tutti null allora non c'è nessun errore, dato che potrebbe essere che il formgroup era facoltativo da compilare.
        if (allSetsOfControlsAreNull == true && allNull == false) {
          allSetsOfControlsAreNull = false;
        }
      });

      //Il formgroup è valido se almeno un set di controlli è stato popolato interamente oppure se erano tutti null i vari set di controlli.
      formGroup.valid = atLeastOneSetOfControlsIsFullyPopulated || allSetsOfControlsAreNull;
    });

    //Invalido i formControl errati e imposto il "pulsante per trovare l'errore" della tabella cvs.
    //Nel caso in cui un formgroup abbia piu set di controlli, sono costretto comunque ad invalidare tutti i formcontrol che erano presenti nei vari set di controllo del formgroup singolo,
    //in quanto non è possibile determinare a priori quali valori "minimi" dovrebbe popolare l'utente. Guardare EFORMS-90 per capire meglio.
    //Trovo anche l'elemento di primo livello da cliccare e creo gli Items che verranno usati dal cvs-validation-modal
    let rules: number = 0;
    let tempItem: CvsItemDTO;

    processedCustomChecks.forEach((formGroup) => {
      if (formGroup.valid == false) {
        formGroup.items.forEach((formControl) => {
          rules++;
          tempItem = cloneDeep(this._koItem);
          tempItem.index = 'KO-' + rules.toString();

          tempItem.id = formControl.controlKey;
          tempItem.text = 'La sezione contenente questi elementi deve essere compilata correttamente o lasciata vuota.';
          tempItem.numeroLotto;
          formControl.form.customProperties.invalid.set(true);

          // utilizzo un uuid per matchare il formcontrol originale a quello dell'item nel modale cvs
          const keyOfMaps = CryptoUtils.generateUuid();
          this._scrollService.errorFormControl.set(keyOfMaps, formControl.form);

          (tempItem as any).formControl = keyOfMaps;

          //Capisco su quale firstLevelItem devo cliccare se l'utente preme il bottone per scoprire dov'è l'errore
          const parts = formControl.pathReactive.split('#');
          let finalTarget: AccordionOutput = {
            id: parts[0]
          };
          let itemToClick = cloneDeep(
            this._formService.firstLevelItems.find((item) => {
              return item.id === parts[0];
            })
          );
          let indexTarget;
          if (itemToClick.items != null && itemToClick.items.length > 0) {
            indexTarget = itemToClick.items.find((item) => {
              return item.labelId === parts[1];
            });
          }
          if (indexTarget != null) {
            finalTarget.index = parts[1].split('-')[1];
            finalTarget.label = indexTarget.label;
          } else {
            finalTarget.label = itemToClick.label;
          }

          // questo è il firstlevelitem su cui devo cliccare se l'utente preme il bottone per scovare dov'è l'errore
          (tempItem as any).finalTarget = finalTarget;
          this.koItems.push(tempItem);
        });
      }
    });

    let cvsOutput: CvsOutputDTO = {
      totalFiredRules: rules,
      totalFailedAsserts: rules,
      items: this.koItems
    };

    if (cvsOutput.items.length > 0) {
      //se ci sono item, vuol dire che ci sono field che l'utente deve cambiare
      customChecksResult.cvsOutputDTO = cvsOutput;
      customChecksResult.passedChecks = false;
    } else {
      customChecksResult.cvsOutputDTO = null;
      customChecksResult.passedChecks = true;
    }

    return customChecksResult;
  }

  public reset() {
    this.customChecks = [];
    this.koItems = [];
  }
}
