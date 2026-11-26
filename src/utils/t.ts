import { signal } from "@lit-labs/signals";
import { getStorage } from ".";
import { getDictionary } from "./dictionary";
import { parseIncomingParams } from "./parse";

function normalizeLang(lang: unknown): string {
  if (typeof lang !== "string") return "id_ID";

  const normalized = lang.trim().toLowerCase().replace("-", "_");
  if (normalized === "en" || normalized === "en_us") return "en_US";
  if (normalized === "id" || normalized === "in" || normalized === "id_id") return "id_ID";

  return "id_ID";
}

export const storedLang = signal("id");
let initPromise: Promise<string> | null = null;

function updateStoredLang(val: string | null | undefined): string {
  if (typeof val === "string" && val.trim()) {
    storedLang.set(val);
  }
  return storedLang.get();
}

export function initLang(): Promise<string> {
  if (!initPromise) {
    initPromise = getStorage<string>("lang", 300, (lateVal) => {
      updateStoredLang(lateVal);
    })
      .then((val) => updateStoredLang(val))
      .catch(() => storedLang.get());
  }
  return initPromise;
}

export function getLang(forceLang?: string): string {
  const root = parseIncomingParams(window.location.search);
  const lang = forceLang || root.get("lang") || storedLang.get();

  return normalizeLang(lang);
}

function formatCase(text: string, mode?: string): string {
  if (!mode || mode === "normal") return text;

  if (mode === "lower") return text.toLocaleLowerCase();
  if (mode === "upper") return text.toLocaleUpperCase();

  return text;
}

const INTERPOLATE_REGEX = /{%\s*(\w+)\s*%}|\{\s*(\w+)\s*\}|%\s*(\w+)\s*%/g;

function interpolate(text: string, params: Record<string, any> = {}): string {
  return text.replace(INTERPOLATE_REGEX, (match: string, a?: string, b?: string, c?: string) => {
    const key = a || b || c;

    if (!key || !(key in params)) {
      return match;
    }

    return String(params[key]);
  });
}

interface TOptions {
  lang?: string;
  params?: Record<string, any>;
  case?: "lower" | "upper" | "capitalize" | "normal";
}

function parseOptions(options?: string | TOptions): TOptions {
  if (typeof options === "string") return { lang: options };
  return options || {};
}

function resolve(dict: Record<string, string> | undefined, key: string, opts: TOptions): string {
  const { params, case: caseMode } = opts;
  const value = dict?.[key];

  if (value) {
    return formatCase(interpolate(value, params), caseMode);
  }

  return formatCase(key, caseMode);
}

export function t(key: string, options?: string | TOptions): string {
  const opts = parseOptions(options);
  const lang = getLang(opts.lang);
  const dict = getDictionary(lang);

  return resolve(dict, key, opts);
}
