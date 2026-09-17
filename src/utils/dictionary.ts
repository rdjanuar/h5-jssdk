import { resolveProxyUrl } from "./url";

export type Dictionary = Record<string, string>;

const dictionaries: Record<string, Dictionary> = {
  id_ID: {},
  en_US: {},
  assets: {},
};

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

export function filterByPrefix(dict: Dictionary, prefix = "finance_miniapp_"): Dictionary {
  const result: Dictionary = {};
  for (const key in dict) {
    if (key.startsWith(prefix)) result[key] = dict[key];
  }
  return result;
}

export async function fetchDictionary(): Promise<void> {
  const BASE_URL = import.meta.env.VITE_API_URL_CONTENT_URL;

  const [assets, en, id] = await Promise.allSettled([
    fetch(resolveProxyUrl(`${BASE_URL}/v2/images/app`)),
    fetch(resolveProxyUrl(`${BASE_URL}/api/translation/v2/all/mobile/en`)),
    fetch(resolveProxyUrl(`${BASE_URL}/api/translation/v2/all/mobile/id`)),
  ]);

  const batch = new Map<string, Dictionary>();

  if (assets.status === "fulfilled" && assets.value.ok) {
    try {
      const toJson = await assets.value.json();
      batch.set("assets", filterByPrefix((toJson?.data || toJson) as Dictionary));
    } catch (e) {
      console.error("Failed to parse assets dictionary:", e);
    }
  }

  if (en.status === "fulfilled" && en.value.ok) {
    try {
      const toJson = await en.value.json();
      if (toJson?.["en"]) {
        batch.set("en_US", filterByPrefix(toJson["en"]));
      }
    } catch (e) {
      console.error("Failed to parse en_US dictionary:", e);
    }
  }

  if (id.status === "fulfilled" && id.value.ok) {
    try {
      const toJson = await id.value.json();
      if (toJson?.["id"]) {
        batch.set("id_ID", filterByPrefix(toJson["id"]));
      }
    } catch (e) {
      console.error("Failed to parse id_ID dictionary:", e);
    }
  }

  batch.forEach((dict, key) => {
    loadDictionary(key, dict);
  });
}

export function loadAssets(apiDict: Dictionary = {}): void {
  loadDictionary("assets", apiDict);
}

export function getAssetUrl(key: string, fallback: string = ""): string {
  const url = dictionaries.assets?.[key] || fallback;
  return resolveProxyUrl(url);
}
