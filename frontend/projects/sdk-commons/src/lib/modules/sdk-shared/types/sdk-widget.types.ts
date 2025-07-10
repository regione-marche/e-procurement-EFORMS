import { EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { IDictionary } from './sdk-common.types';

export interface ISdkBaseWidget extends OnInit, OnDestroy {
    id: string;
    widget: string;
    module: string;
}

export interface ISdkWidget extends ISdkBaseWidget {
    input: Observable<IDictionary<any>>;
    output: EventEmitter<IDictionary<any>>;
    error: EventEmitter<IDictionary<any>>;
}
