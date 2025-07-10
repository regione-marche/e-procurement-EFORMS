import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function customPatternValidator(field: any): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    const pattern = field?.pattern;

    if (!value) {
      return null;
    }

    const patternValid = new RegExp(pattern.value).test(value);

    return !patternValid ? { patternValid } : null;
  };
}
