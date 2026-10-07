export const SKEY: string; export const VKEY: string;
export function loadSession(env: any): any; export function saveSession(env: any, s: any): void; export function googleUrl(env: any, redirectTo: string): Promise<string>;
export function handleCallback(env: any, search: string): Promise<any>; export function accessToken(env: any): Promise<string | null>; export function signOut(env: any): Promise<void>; export function rpc(env: any, fn: string, body?: any): Promise<any>;
export function decodeJwt(t: string): any; export function b64url(b: any): string;
