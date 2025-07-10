import { IDictionary } from '@maggioli/sdk-commons';

export class CryptoUtils {
    public static generateUuid(): string {
        return crypto.randomUUID();
    }

    public static getJwtTokenClaims(token: string): IDictionary<any> {
        return JSON.parse(atob(token.split('.')[1]));
    }
}