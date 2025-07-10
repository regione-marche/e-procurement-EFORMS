import { Observable } from 'rxjs';

export interface SdkLongOperationConfig {
    delay: number;
    maxIterations: number;
    totalTimeout?: number;

    pool: () => Observable<any>;
}