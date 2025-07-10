import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ScrollService } from '../services/formcontrol-scroll.service';

@Directive({
  selector: '[formControlScroll]'
})
export class FormControlScrollDirective implements OnInit {
  @Input() formControl!: FormControl;
  @Input() elementRef!: ElementRef;

  constructor(private el: ElementRef, private scrollService: ScrollService) {}

  ngOnInit() {
    if (this.formControl && this.elementRef) {
      this.scrollService.registerControl(this.formControl, this.el);
    }
  }

  ngOnDestroy() {
    if (this.formControl) {
      this.scrollService.unregisterControl(this.formControl);
    }
  }
}
