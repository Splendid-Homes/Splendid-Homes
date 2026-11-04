'use client';

import { useSyncExternalStore } from 'react';

/**
 * Tiny localStorage-backed stores for visitor preferences (no account needed).
 * Server and first paint use the default value, so there is no hydration mismatch.
 */
function createStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cache: { raw: string | null; value: T } | null = null;
  const read = (): T => {
    let raw: string | null = null;
    try { raw = localStorage.getItem(key); } catch { /* storage unavailable */ }
    if (cache && cache.raw === raw) return cache.value;
    let value = fallback;
    try { value = raw ? (JSON.parse(raw) as T) : fallback; } catch { value = fallback; }
    cache = { raw, value };
    return value;
  };
  const write = (v: T) => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { /* storage unavailable */ }
    listeners.forEach(l => l());
  };
  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => { if (e.key === key) cb(); };
    window.addEventListener('storage', onStorage);
    return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage); };
  };
  const use = () => useSyncExternalStore(subscribe, read, () => fallback);
  return { use, read, write };
}

const favs = createStore<string[]>('sh_favs', []);
export const useFavs = favs.use;
export function toggleFav(id: string) {
  const cur = favs.read();
  const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
  favs.write(next);
  return next.includes(id);
}

/** Compare list (up to COMPARE_MAX, set from CMS > Compare & Saved pages). Keeps a little card data so the tray needs no server round trip. */
export let COMPARE_MAX = 3;
export const setCompareMax = (n: number) => { COMPARE_MAX = n; };
export type CompareItem = { id: string; title: string; img: string };
const compare = createStore<CompareItem[]>('sh_compare', []);
export const useCompare = compare.use;
export const readCompare = compare.read;
/** Adds or removes a property. Returns 'full' (and adds nothing) when the limit is reached. */
export function toggleCompare(item: CompareItem): 'added' | 'removed' | 'full' {
  const cur = compare.read();
  if (cur.some(x => x.id === item.id)) { compare.write(cur.filter(x => x.id !== item.id)); return 'removed'; }
  if (cur.length >= COMPARE_MAX) { window.dispatchEvent(new Event('compare:full')); return 'full'; }
  compare.write([...cur, item]);
  return 'added';
}
export const removeCompare = (id: string) => compare.write(compare.read().filter(x => x.id !== id));
export const clearCompare = () => compare.write([]);
