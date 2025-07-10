import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[view-ref]',
})
export class SdkTableViewRefDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}