export const FLAG_MAPS: string[]; export const REC_MAPS: string[];
export function blank(): any; export function normalize(s: any): any; export function mergeFlags(a: any, b: any): any; export function mergeRecs(a: any, b: any): any;
export function merge(local: any, cloud: any): any; export function same(a: any, b: any): boolean;
export function isFlagOn(map: Record<string, number>, id: string): boolean; export function setFlag(map: Record<string, number>, id: string, on: boolean, now: number): Record<string, number>;
