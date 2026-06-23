export const GLOBAL_LOCALES = ['en', 'es', 'zh'] as const
export type GlobalLocale = (typeof GLOBAL_LOCALES)[number]

export function isLocaleOf(value: string, locales: string[]): boolean {
  return locales.includes(value)
}

export function t(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`))
}
