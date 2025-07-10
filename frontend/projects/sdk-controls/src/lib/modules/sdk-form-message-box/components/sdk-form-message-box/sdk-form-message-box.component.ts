import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { IDictionary } from '@maggioli/sdk-commons';
import { get, has, isEmpty } from 'lodash-es';

import { SdkFormMessageItem } from '../../sdk-form-message-box.domain';

/**
 * Componente per renderizzare un messaggio di alert in un campo form
 */
@Component({
  selector: 'sdk-form-message-box',
  templateUrl: './sdk-form-message-box.component.html',
  styleUrls: ['./sdk-form-message-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SdkFormMessageBoxComponent {

  /**
   * @ignore
   */
  @Input() public messagesMap: IDictionary<Array<SdkFormMessageItem>>;
  /**
   * @ignore
   */
  @Input() public messagesLevels: Array<string>;

  /**
   * @ignore
   */
  constructor() { }

  /**
   * @ignore
   */
  public getMessages(level: string): Array<SdkFormMessageItem> {
    return (!isEmpty(level) && has(this.messagesMap, level)) ? get(this.messagesMap, level) : [];
  }

  /**
   * @ignore
   */
  public getPanelClass(level: string): string {
    return level + '-message';
  }

}
