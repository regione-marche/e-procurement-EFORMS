import { Injectable, Injector, Type } from '@angular/core';

@Injectable()
export class SdkDatasourceService {

    constructor(private injector: Injector) { }

    public create<T>(type: Type<T>, params: any = {}): T {
        return new type(this.injector, params);
    }

}
