import type { ReactiveController, ReactiveControllerHost } from "lit";
import { getStorage } from ".";
import { getDictionary } from "./dictionary";

function normalizeLang(lang: unknown): string {
  if (typeof lang !== "string") return "id_ID";

  const normalized = lang.trim().toLowerCase().replace("-", "_");
  if (normalized === "en" || normalized === "en_us") return "en_US";
  if (normalized === "id" || normalized === "in" || normalized === "id_id") return "id_ID";

  return "id_ID";
}

let storedLang = "id";
let initPromise: Promise<string> | null = null;
const langHosts = new Set<ReactiveControllerHost>();

export class LangController implements ReactiveController {
  private host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    langHosts.add(this.host);
  }

  hostDisconnected(): void {
    langHosts.delete(this.host);
  }
}

function updateStoredLang(val: string | null | undefined): string {
  if (typeof val === "string" && val.trim()) {
    const prev = getLang();
    storedLang = val;
    const next = getLang();
    if (next !== prev) {
      langHosts.forEach((host) => host.requestUpdate());
    }
  }
  return storedLang;
}

export function initLang(): Promise<string> {
  if (!initPromise) {
    initPromise = getStorage<string>("lang", 300, (lateVal) => {
      updateStoredLang(lateVal);
    })
      .then((val) => updateStoredLang(val))
      .catch(() => storedLang);
  }
  return initPromise;
}

export function getLang(forceLang?: string): string {
  const root = new URLSearchParams(window.location.search);
  const lang = forceLang || root.get("lang") || storedLang;

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
