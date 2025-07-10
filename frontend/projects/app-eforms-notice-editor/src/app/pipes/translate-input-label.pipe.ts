import { Pipe, PipeTransform, inject } from '@angular/core';
import { DataService } from '../services/data.service';

@Pipe({
  name: 'translateInputLabel'
})
export class TranslateInputLabelPipe implements PipeTransform {
  private _dataService: DataService = inject(DataService);

  public transform(value: string, ..._args: any[]): string {
    return this._dataService.getLabel(value) ?? value;
  }
}
