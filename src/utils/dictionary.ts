import { resolveProxyUrl } from "./url";

export type Dictionary = Record<string, string>;

// State internal di dalam webview untuk menampung data assets/bahasa
const dictionaries: Record<string, Dictionary> = {
  id_ID: {},
  en_US: {},
  assets: {},
};

// Jika trpy-scanner punya assets lokal sendiri untuk fallback sebelum di-inject,
// kamu bisa import dan masukkan ke sini. Jika tidak ada, biarkan object kosong.
const baseMap: Record<string, Dictionary> = {
  id_ID: {},
  en_US: {},
  assets: {},
};

export function setDictionary(lang: string, dict: Dictionary): void {
  dictionaries[lang] = dict;
}

export function getDictionary(lang: string): Dictionary | undefined {
  return dictionaries[lang];
}

export function loadDictionary(lang: string, apiDict: Dictionary = {}): void {
  const base = baseMap[lang] || {};
  const merged: Dictionary = {
    ...base,
    ...apiDict,
  };

  setDictionary(lang, merged);
}

export function loadAssets(apiDict: Dictionary = {}): void {
  loadDictionary("assets", apiDict);
}

export function getAssetUrl(key: string, fallback: string = ""): string {
  const url = dictionaries.assets?.[key] || fallback;
  return resolveProxyUrl(url);
}
