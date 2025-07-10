import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  Type,
  ViewContainerRef,
} from '@angular/core';
import { includes, toString } from 'lodash-es';
import { Observable, Subject, Subscription } from 'rxjs';
import { delay, first, map, tap } from 'rxjs/operators';

import { SdkBaloonConfig, SdkBaloonResponsiveConfig } from './sdk-baloon.domain';

/**
 * Direttiva per creare un baloon
 */
@Directive({
  selector: '[sdkBaloon]'
})
export class SdkBaloonDirective implements OnInit, OnDestroy {

  /**
   * @ignore
   */
  private _initConfig: boolean = false;

  /**
   * @ignore
   */
  public smallDevice: Subject<boolean> = new Subject<boolean>();
  /**
   * @ignore
   */
  public smallDeviceSub: Subscription;
  /**
   * @ignore
   */
  public smallDeviceVal: boolean;
  /**
   * @ignore
   */
  public mediaObsSub: Subscription;
  /**
   * @ignore
   */
  @Output() public onBaloonOpen: EventEmitter<boolean> = new EventEmitter<boolean>();
  /**
   * @ignore
   */
  @Output() public onBaloonClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * @ignore
   */
  public ngOnInit(): void {
    if (this.element) {
      this.element.dataset.baloon = 'true'
    }
  }

  /**
   * @ignore
   */
  public ngOnDestroy(): void {
    this.removeSmallDeviceSub();
    this.removeClickListener();
    this.removeScrollListener();
  }

  /**
   * @ignore
   */
  private removeSmallDeviceSub() {
    if (this.smallDeviceSub) {
      this.smallDeviceSub.unsubscribe();
      this.smallDeviceSub = undefined;
    }
  }

  /**
   * @ignore
   */
  private addClickListener() {
    this.removeClickListener();
    this.ngz.runOutsideAngular(() => {
      document.addEventListener('click', this.clickout, true);
    });
  }

  /**
   * @ignore
   */
  private removeClickListener() {
    this.ngz.runOutsideAngular(() => {
      document.removeEventListener('click', this.clickout, true);
    });
  }

  /**
   * @ignore
   */
  private addScrollListener() {
    this.removeScrollListener()
    this.ngz.runOutsideAngular(() => {
      window.addEventListener('scroll', this.scroll, true);
    });
  }

  /**
   * @ignore
   */
  private removeScrollListener() {
    this.ngz.runOutsideAngular(() => {
      window.removeEventListener('scroll', this.scroll, true);
    });
  }

  /**
   * @ignore
   */
  private _sdkBaloonConfigOriginal: SdkBaloonConfig;
  /**
   * @ignore
   */
  private _sdkBaloonConfig: SdkBaloonConfig;

  /**
   * @ignore
   */
  get sdkBaloonConfig(): SdkBaloonConfig {
    return this._sdkBaloonConfig;
  }

  /**
   * @ignore
   */
  @Input('sdkBaloon') set sdkBaloonConfig(val: SdkBaloonConfig) {
    if (val) {
      this.initConfig(this._sdkBaloonConfig = this._sdkBaloonConfigOriginal = val);
    }
  }

  /**
   * @ignore
   */
  @HostListener('click') onClick() {
    if (this.element) {
      if (this.element.dataset.baloonVisible !== 'true') {
        this.openBaloon();
      } else {
        this.ngz.run(() => {
          this.closeBaloon();
        });
      }
    }
  }

  /**
   * @ignore
   */
  @HostListener('keyup.enter') onEnter() {
    if (this.element) {
      if (this.element.dataset.baloonVisible !== 'true') {
        this.openBaloon();
      } else {
        this.ngz.run(() => {
          this.closeBaloon();
        });
      }
    }
  }

  /**
   * @ignore
   */
  clickout = (ev: MouseEvent) => {
    if (this.element) {
      if (this.element.dataset.baloonVisible === 'true') {
        if (!this.element.contains(ev.target as HTMLElement)) {
          this.ngz.run(() => {
            this.closeBaloon();
          });
        }
      }
    }
  }

  /**
   * @ignore
   */
  scroll = (ev: MouseEvent) => {
    if (this.element) {
      if (this.element.dataset.baloonVisible === 'true') {
        if (!this.element.contains(ev.target as HTMLElement)) {
          this.ngz.run(() => {
            this.closeBaloon();
          });
        }
      }
    }
  }

  /**
   * @ignore
   */
  private moveHtmlComponent(parent: DOMRect | ClientRect, child: DOMRect | ClientRect, element: HTMLElement, pos: string): void {

    if (!parent || !child || !child.height) { return; }

    const page = { width: window.innerWidth, height: window.innerHeight };

    if (includes(['left', 'right'], pos)) {

      const deltaUp = parent.top - ((child.height * 0.5) - (parent.height * 0.5));
      const deltaDown = page.height - ((child.height * 0.5) + (parent.height * 0.5) + parent.top);

      if (deltaUp < this.confTop) {
        element.style.marginTop = `${(this.confTop) - deltaUp}px`;
      }
      else if (deltaDown < this.confBottom) {
        element.style.marginTop = `${deltaDown - (this.confBottom)}px`;
      }

    } else if (includes(['up', 'down'], pos)) {

      const deltaX = page.width - ((child.width * 0.5) + (parent.width * 0.5) + parent.left); // left or right
      if (deltaX < 0) { element.style.marginRight = `${deltaX - 15}px`; }

    } else if (includes(['up-right', 'down-right'], pos)) {

      const deltaY = page.height - (child.height + parent.height + parent.top); // top or bottom
      if (deltaY < 0) {
        this.element.dataset.baloonPos = 'up-right'
      }

    }

  }

  /**
   * @ignore
   */
  private _htmlElement: HTMLElement;

  /**
   * @ignore
   */
  private openBaloon(): void {
    if (this.confDisabled) {
      (this.confDisabled as Observable<boolean>)
        .pipe(first()).subscribe(disabled => {
          if (disabled !== true) {
            if (this.element.dataset.baloonVisible !== 'true') {
              this.element.dataset.baloonVisible = 'true';

              this.addClickListener();
              this.addScrollListener();

              if (this.confHtml) {

                const cmp = this.vcr.createComponent(this.confHtml);

                if (this.confInput) {
                  (this.confInput as Observable<any>)
                    .pipe(first()).subscribe(input => {
                      (cmp.instance as any).input = input;
                    });
                }

                const el = this._htmlElement = cmp.location.nativeElement as HTMLElement;

                el.addEventListener('click', ev => {
                  try {
                    ev.stopPropagation();
                    ev.stopImmediatePropagation();
                  } catch (err) {
                    console.error(err);
                  }
                });

                el.dataset.baloonHtml = 'true';

                this.element.appendChild(el);

                setTimeout(() => {
                  this.moveHtmlComponent(
                    this.element.getBoundingClientRect(),
                    el.getBoundingClientRect(),
                    el, this.confPos
                  );

                  this.onBaloonOpen.emit(true);
                });

                if ((cmp.instance as any).fit$) {
                  (cmp.instance as any).fit$
                    .pipe(first(),
                      delay(75),
                      map(() => {
                        el.dataset.baloonFit = 'true'
                      }),
                      delay(125),
                      map(() => {
                        this.moveHtmlComponent(
                          this.element.getBoundingClientRect(),
                          el.getBoundingClientRect(),
                          el, this.confPos
                        );
                      }),
                      delay(125),
                      map(() => {
                        el.dataset.baloonScroll = 'true'
                      })
                    ).subscribe();
                }

                if ((cmp.instance as any).close$) {
                  (cmp.instance as any).close$
                    .pipe(
                      first(),
                      tap(() => {
                        this.closeBaloon()
                      }),
                      delay(125),
                      map(res => {
                        try {
                          const cb = this.confOutput;
                          if (cb) { cb(res) }
                        } catch (err) {
                          console.error(err)
                        }
                      })
                    ).subscribe();
                }
              }
            }
          }
        })
    }
  }

  /**
   * @ignore
   */
  private closeBaloon(): void {
    if (this.element.dataset.baloonVisible === 'true') {
      delete this.element.dataset.baloonVisible;

      this.removeClickListener();
      this.removeScrollListener();

      this.onBaloonClose.emit(true);

      if (this.confHtml) {
        setTimeout(() => {
          const html = this.element.querySelector('[data-baloon-html]')
          if (html) { html.parentElement.removeChild(html); }
        }, 500);
      }

      this._sdkBaloonConfig = { ...this._sdkBaloonConfigOriginal }

    }
  }

  /**
   * @ignore
   */
  private initConfig(val: SdkBaloonConfig): void {
    if (!this._initConfig) {
      this._initConfig = true;

      this.element.dataset.baloonDim = val && val.dim ? toString(val.dim) : 'medium';
      this.element.dataset.baloonPos = val && val.pos ? toString(val.pos) : 'top';

      if (val && val.back) {
        this.element.dataset.baloonBack = toString(val.back);
      }

      if (this._sdkBaloonConfig.responsive) {
        this.initMediaBreakpoint(this._sdkBaloonConfig.responsive);
      }
    }
  }

  /**
   * @ignore
   */
  protected initMediaBreakpoint(config: SdkBaloonResponsiveConfig): void {

    if (this.smallDeviceSub) {
      this.smallDeviceSub.unsubscribe();
      this.smallDeviceSub = undefined;
    }

    this.smallDeviceSub = this.smallDevice.subscribe((val: boolean) => {

      if (val === true || val === false) {

        if (this.smallDeviceVal !== val) {
          this.smallDeviceVal = val;

          if (val === false) { // large

            this.element.dataset.baloonDim = this._sdkBaloonConfig.dim;
            this.element.dataset.baloonPos = this._sdkBaloonConfig.pos;

          } else { // small

            this.element.dataset.baloonDim = this._sdkBaloonConfig.responsive.dim;
            this.element.dataset.baloonPos = this._sdkBaloonConfig.responsive.pos;

          }

          if (this._htmlElement) {
            setTimeout(() => {
              this.moveHtmlComponent(
                this.element.getBoundingClientRect(),
                this._htmlElement.getBoundingClientRect(),
                this._htmlElement, this.confPos
              );
            });
          }

        }

      }

    });
  }

  /**
   * @ignore
   */
  private get element(): HTMLElement {
    return this.el.nativeElement as HTMLElement;
  }

  /**
   * @ignore
   */
  private get confBack(): boolean {
    if (this._sdkBaloonConfig && this._sdkBaloonConfig.back) {
      return this._sdkBaloonConfig.back;
    }
    return false;
  }

  /**
   * @ignore
   */
  private get confHtml(): Type<any> {
    if (this._sdkBaloonConfig && this._sdkBaloonConfig.html) {
      return this._sdkBaloonConfig.html;
    }
    return undefined;
  }

  /**
   * @ignore
   */
  private get confInput(): any {
    if (this._sdkBaloonConfig && this._sdkBaloonConfig.input) {
      return this._sdkBaloonConfig.input();
    }
    return undefined;
  }

  /**
   * @ignore
   */
  private get confOutput(): any {
    if (this._sdkBaloonConfig && this._sdkBaloonConfig.output) {
      return this._sdkBaloonConfig.output;
    }
    return undefined;
  }

  /**
   * @ignore
   */
  private get confDisabled(): any {
    if (this._sdkBaloonConfig && this._sdkBaloonConfig.disabled) {
      return this._sdkBaloonConfig.disabled();
    }
    return undefined;
  }

  /**
   * @ignore
   */
  private get confPos(): string {
    if (this._sdkBaloonConfig && this._sdkBaloonConfig.pos) {
      return this._sdkBaloonConfig.pos;
    }
    return undefined;
  }

  /**
   * @ignore
   */
  private get confTop(): number {
    if (this._sdkBaloonConfig && this._sdkBaloonConfig.frameTop) {
      return this._sdkBaloonConfig.frameTop;
    }
    return 0;
  }

  /**
   * @ignore
   */
  private get confBottom(): number {
    if (this._sdkBaloonConfig && this._sdkBaloonConfig.frameBottom) {
      return this._sdkBaloonConfig.frameBottom;
    }
    return 0;
  }

  /**
   * @ignore
   */
  private highlight(color: string) {
    this.el.nativeElement.style.backgroundColor = color;
  }

  /**
   * @ignore
   */
  private coords(elem: HTMLElement) {
    const box = elem.getBoundingClientRect();

    console.log(box);

    return {
      top: box.top + window.pageYOffset,
      right: box.right + window.pageXOffset,
      bottom: box.bottom + window.pageYOffset,
      left: box.left + window.pageXOffset
    };
  }

  /**
   * @ignore
   */
  constructor(private ngz: NgZone, private el: ElementRef, private vcr: ViewContainerRef) { }

}
