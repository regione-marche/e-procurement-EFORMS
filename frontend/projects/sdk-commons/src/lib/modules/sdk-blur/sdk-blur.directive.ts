import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { each } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';

/**
 * Direttiva che ti permette di fare tab
 */
@Directive({
  selector: '[sdkBlur]'
})
export class SdkBlurDirective implements OnInit, OnDestroy {

  @Input() public blurEnabled: boolean;

  @Output() public onBlur = new EventEmitter();

  private blur = new Subject();
  private subscriptions: Array<Subscription>;

  constructor() {
    this.subscriptions = new Array();
  }

  public ngOnInit(): void {

    this.subscriptions.push(this.blur.subscribe(e => this.onBlur.emit(e)));
  }

  public ngOnDestroy(): void {
    if (this.subscriptions != null) {
      each(this.subscriptions, (s: Subscription) => {
        s.unsubscribe();
      });
    }
  }

  @HostListener('blur', ['$event'])
  public blurEvent(event: KeyboardEvent) {
    if(this.blurEnabled === true) {
      event.preventDefault();
      event.stopPropagation();
      this.blur.next(event);
    }
  }


}
