export const WAT: number; export const DAY: number;
export function watTime(date: string, hh?: number, mm?: number): number; export function watDate(ms: number): string; export function watDow(ms: number): number;
export function addDays(date: string, n: number): string; export function daysBetween(a: string, b: string): number;
export function countdown(target: number, now: number): { d: number; h: number; m: number; s: number; done: boolean };
export function phase(campStart: string, now: number, campDays?: number): { kind: 'before' | 'camp' | 'service' | 'done'; days?: number; day?: number; of?: number; month?: number };
export function nextDow(dow: number, now: number): string; export function monthKey(ms: number): string; export function monthLabel(key: string): string;
export function serviceMonths(campStart: string, n?: number, campDays?: number): string[];
export function clearanceStatus(key: string, cleared: boolean, now: number): 'done' | 'upcoming' | 'missed' | 'due' | 'late';
export interface CalEvent { uid: string; title: string; date: string; hh?: number; mm?: number; mins?: number; rrule?: string; desc?: string; alarmMin?: number }
export function ics(events: CalEvent[], stampMs: number): string; export function gcalLink(e: CalEvent): string;
export function naira(n: number): string;
export function monthTotals(list: any[], key: string): { in: number; out: number; left: number; byCat: Record<string, number> };
