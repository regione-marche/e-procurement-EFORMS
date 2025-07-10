import { Pipe, PipeTransform, inject } from '@angular/core';
import { DataService } from '../services/data.service';

@Pipe({
  name: 'translateLabel'
})
export class TranslateLabelPipe implements PipeTransform {
  private _dataService: DataService = inject(DataService);

  public transform(value: string, ...args: any[]): string {
    let label: string = this._dataService.getLabel(value) ?? value;
    return label;
  }
}
