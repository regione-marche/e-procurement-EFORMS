import { Injectable } from '@angular/core';
import hashSum from 'hash-sum';

@Injectable({ providedIn: 'root' })
export class SdkHashHelperService {

    public constructor() { }

    public hash<X>(obj: X): string { return hashSum(obj) }

}