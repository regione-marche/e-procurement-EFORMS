import { ElementRef, Injectable, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AccordionOutput, ErrorNavigationState } from '../models/app.model';

@Injectable({
  providedIn: 'root'
})
export class ScrollService {
  private formControlMap = new Map<FormControl, ElementRef>();
  public failedAsserts: any;
  public errorFormControl = new Map<string, FormControl>();
  public clickFirstLevelItem = signal<ErrorNavigationState>({
    navigate: false,
    target: null
  });
  public coordinateY: number;

  registerControl(control: FormControl, element: ElementRef) {
    this.formControlMap.set(control, element);
  }

  unregisterControl(control: FormControl) {
    this.formControlMap.delete(control);
  }

  scrollToControl(id: string, options?: ScrollIntoViewOptions) {
    setTimeout(() => {
      const element = this.formControlMap.get(this.errorFormControl.get(id));
      if (element) {
        element.nativeElement.scrollIntoView(options || { behavior: 'smooth', block: 'center' });
      } else {
        console.error('FormControl related to the error not found');
      }
    });
  }

  scrollToY(contentSection: HTMLElement) {
    setTimeout(() => {
      contentSection.scrollTo({
        //aggiungo 0.01 perche non è super preciso lo scroll e spesso si ritrova leggermente sopra al target
        top: this.coordinateY + this.coordinateY * 0.01,
        behavior: 'smooth'
      });
    });
  }

  triggerNavigation(target: AccordionOutput): void {
    this.clickFirstLevelItem.set({
      navigate: true,
      target: target
    });
  }

  resetNavigation(): void {
    this.clickFirstLevelItem.set({
      navigate: false,
      target: null
    });
  }

  reset() {
    this.formControlMap.clear();
    this.errorFormControl.clear();
    this.resetNavigation();
    this.failedAsserts = null;
  }
}
