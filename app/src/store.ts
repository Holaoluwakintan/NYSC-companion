import { blank, normalize, setFlag, isFlagOn } from './lib/sync-core.js';
import { APP } from './config';
import { NEXT_CAMP } from './data/facts';

export interface Profile { ts: number; name?: string; state?: string; batch?: string; campStart?: string; cdsDay?: number; cdsGroup?: string; ppa?: string; onboarded?: boolean }
export interface Rec { ts: number; del?: boolean }
export interface Custom extends Rec { label: string; group: string }
export interface Entry extends Rec { type: 'in' | 'out'; amt: number; cat: string; note?: string; date: string }
export interface State { v: 1; profile: Profile; check: Record<string, number>; clear: Record<string, number>; cds: Record<string, number>; custom: Record<string, Custom>; budget: Record<string, Entry> }

const KEY = APP.storageKey + ':state:v1';
let state: State = load();
const subs = new Set<() => void>();
const saveHooks = new Set<() => void>();
let ver = 0;

function load(): State { try { return normalize(JSON.parse(localStorage.getItem(KEY) || 'null')) as State; } catch { return blank() as State; } }
function persist() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* storage full */ } }
export const get = () => state;
export const version = () => ver;
export function subscribe(f: () => void) { subs.add(f); return () => { subs.delete(f); }; }
export function onSave(f: () => void) { saveHooks.add(f); }
function emit(save = true) { ver++; persist(); subs.forEach(f => f()); if (save) saveHooks.forEach(f => f()); }
export const now = () => Date.now();

export function replace(s: State) { state = normalize(s) as State; emit(false); }
export function reset() { state = blank() as State; emit(false); }

export function setProfile(p: Partial<Profile>) { state = { ...state, profile: { ...state.profile, ...p, ts: now() } }; emit(); }
export function toggleCheck(id: string) { state = { ...state, check: setFlag(state.check, id, !isFlagOn(state.check, id), now()) }; emit(); }
export const checked = (id: string) => isFlagOn(state.check, id);
export function setClear(month: string, on: boolean) { state = { ...state, clear: setFlag(state.clear, month, on, now()) }; emit(); }
export const cleared = (month: string) => isFlagOn(state.clear, month);
export function setCds(date: string, on: boolean) { state = { ...state, cds: setFlag(state.cds, date, on, now()) }; emit(); }
export const attended = (date: string) => isFlagOn(state.cds, date);

const uid = () => Math.random().toString(36).slice(2, 10) + now().toString(36).slice(-4);
export function addCustom(label: string, group: string) { const id = 'u' + uid(); state = { ...state, custom: { ...state.custom, [id]: { label, group, ts: now() } } }; emit(); return id; }
export function delCustom(id: string) { const c = state.custom[id]; if (!c) return; state = { ...state, custom: { ...state.custom, [id]: { ...c, del: true, ts: now() } } }; emit(); }
export const customs = (group: string) => Object.entries(state.custom).filter(([, c]) => !c.del && c.group === group).sort((a, b) => a[1].ts - b[1].ts);

export function addEntry(e: Omit<Entry, 'ts'>) { const id = 'b' + uid(); state = { ...state, budget: { ...state.budget, [id]: { ...e, ts: now() } } }; emit(); return id; }
export function delEntry(id: string) { const c = state.budget[id]; if (!c) return; state = { ...state, budget: { ...state.budget, [id]: { ...c, del: true, ts: now() } } }; emit(); }
export function restoreEntry(id: string) { const c = state.budget[id]; if (!c) return; state = { ...state, budget: { ...state.budget, [id]: { ...c, del: false, ts: now() } } }; emit(); }
export const entries = () => Object.entries(state.budget).filter(([, e]) => !e.del).sort((a, b) => (b[1].date.localeCompare(a[1].date)) || b[1].ts - a[1].ts);

export function campStart(): string { return state.profile.campStart || NEXT_CAMP.start; }
export function hasData() { const s = state; return Object.keys(s.check).length + Object.keys(s.budget).length + Object.keys(s.custom).length + Object.keys(s.clear).length + Object.keys(s.cds).length > 0 || !!s.profile.name; }

// Device-only settings (not synced)
const SKEY = APP.storageKey + ':settings:v1';
export interface Settings { theme: 'auto' | 'light' | 'dark'; deviceId: string; notify?: boolean; lastNotified?: string }
let settings: Settings = (() => { try { return { theme: 'auto', deviceId: '', ...JSON.parse(localStorage.getItem(SKEY) || '{}') }; } catch { return { theme: 'auto', deviceId: '' }; } })();
if (!settings.deviceId) { settings.deviceId = uid() + uid(); try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch { /* */ } }
export const getSettings = () => settings;
export function setSettings(p: Partial<Settings>) { settings = { ...settings, ...p }; try { localStorage.setItem(SKEY, JSON.stringify(settings)); } catch { /* */ } subs.forEach(f => f()); }
