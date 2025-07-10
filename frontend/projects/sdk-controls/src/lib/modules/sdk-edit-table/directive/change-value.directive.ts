import { Directive, ElementRef, EventEmitter, Input, Output } from "@angular/core";

@Directive({
    selector: '[changeD]',
  })
  export class ChangeDirective {
    private _value: string;
  
    @Output('input') public input$: EventEmitter<string> = new EventEmitter();
  
    constructor(private el: ElementRef) {}
  
    private get element(): HTMLInputElement {
      return this.el != null ? this.el.nativeElement : null;
    }
  
    @Input('data') public set value(value: string) {
      this._value = value;
  
      const parsedValue = parseFloat(this._value);
      
      if (!isNaN(parsedValue)) {
        this.element.value = parsedValue.toFixed(2);
        this.input$.emit(this._value);
      } else {
        this.element.value = '';
        this.input$.emit('');
      }
    }
  
    public get value() {
      return this._value;
    }
  }
  