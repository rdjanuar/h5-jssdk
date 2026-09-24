import { getDictionary } from "./dictionary";

function normalizeLang(lang: string | undefined): string {
  if (lang === "en") return "en_US";
  if (["id", "in"].includes(lang!)) return "id_ID";

  return "id_ID";
}

function getLang(forceLang?: string): string {
  const root = new URLSearchParams(window.location.search);
  const lang = root.get("lang") ?? "id";

  return normalizeLang(forceLang || lang);
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
