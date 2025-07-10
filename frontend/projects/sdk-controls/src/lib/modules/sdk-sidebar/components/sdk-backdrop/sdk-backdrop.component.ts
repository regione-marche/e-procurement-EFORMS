import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

/**
 * Componente per renderizzare un backdrop dietro la sidebar
 */
@Component({
  selector: 'sdk-backdrop',
  templateUrl: './sdk-backdrop.component.html',
  styleUrls: ['./sdk-backdrop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkBackdropComponent {

  /**
   * @ignore
   */
  @Output() public onClick: EventEmitter<boolean> = new EventEmitter<boolean>();

  /**
   * @ignore
   */
  constructor() { }

  /**
   * @ignore
   */
  public backdropClick(): void { this.onClick.emit(true) }

}
