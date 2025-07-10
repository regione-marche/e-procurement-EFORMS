import { Directive, EventEmitter, HostListener, OnDestroy, OnInit, Output } from '@angular/core';
import { each } from 'lodash-es';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

/**
 * Direttiva che ti permette di cliccare con accessibilita' (click e invio)
 */
@Directive({
  selector: '[sdkClick]'
})
export class SdkClickDirective implements OnInit, OnDestroy {

  private debounceTime: number = 100;

  @Output() public aClick = new EventEmitter();

  private clicks = new Subject();
  private debounceClicks = new Subject();
  private subscriptions: Array<Subscription>;

  constructor() {
    this.subscriptions = new Array();
  }

  public ngOnInit(): void {
    this.subscriptions.push(this.clicks.pipe(
    ).subscribe(e => this.aClick.emit(e)));

    this.subscriptions.push(this.debounceClicks.pipe(
      debounceTime(this.debounceTime)
    ).subscribe(e => this.aClick.emit(e)));
  }

  public ngOnDestroy(): void {
    if (this.subscriptions != null) {
      each(this.subscriptions, (s: Subscription) => {
        s.unsubscribe();
      });
    }
  }

  @HostListener('click', ['$event'])
  public clickEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.clicks.next(event);
  }

  @HostListener('keydown.enter', ['$event'])
  public enterEvent(event: any) {
    event.preventDefault();
    event.stopPropagation();
    this.debounceClicks.next(event);
  }


}
