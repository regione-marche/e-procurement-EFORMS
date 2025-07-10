import { Component, OnInit } from "@angular/core";
import { CryptoUtils } from '../utils/crypto-utils';

@Component({ template: '' })
export abstract class AbstractNoticeComponent implements OnInit {

    /**
     * Id random (utilizzato ad esempio per collegare la label ad un campo di testo)
     */
    public componentRandomId: string = null;

    constructor() { }

    public ngOnInit(): void {
        this.componentRandomId = this.generateUniqueCode();
    }

    /**
     * Generate unique id for components
     */
    protected generateUniqueCode(): string {
        return CryptoUtils.generateUuid();
    }
}