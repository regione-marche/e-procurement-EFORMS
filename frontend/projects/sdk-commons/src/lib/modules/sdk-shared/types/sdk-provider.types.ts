import { Observable } from 'rxjs';

import { IDictionary } from './sdk-common.types';

export interface SdkProvider {
    run(args: IDictionary<any> | any): Observable<IDictionary<any> | any> | any;
}
