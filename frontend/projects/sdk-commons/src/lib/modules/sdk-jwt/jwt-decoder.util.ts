import { jwtDecode } from 'jwt-decode';

export function decodeJwt(token: string): any {
    return jwtDecode(token);
}