import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

/**
 * Componente per renderizzare un backdrop dietro la sidebar
 */
@Component({
  selector: 'sdk-modal-backdrop',
  templateUrl: './sdk-modal-backdrop.component.html',
  styleUrls: ['./sdk-modal-backdrop.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkModalBackdropComponent {

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
