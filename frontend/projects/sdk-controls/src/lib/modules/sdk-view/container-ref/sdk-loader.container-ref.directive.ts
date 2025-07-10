import { Directive, ViewContainerRef } from '@angular/core';

/**
 * Direttiva da utilizzare come placeholder per caricare dinamicamente in pagina un componente angular
 */
@Directive({
  selector: '[sdkLoaderContainerRef]'
})
export class SdkLoaderContainerRefDirective {

  /**
   * @ignore
   */
  constructor(public viewContainerRef: ViewContainerRef) { }

}
