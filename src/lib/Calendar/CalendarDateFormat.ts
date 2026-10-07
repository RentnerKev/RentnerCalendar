import type { CalendarLocale } from './messages.js'

const cache = new Map<string, ReturnType<typeof createFormatters>>()

function createFormatters(locale: string, timeZone: string) {
    return {
        full: new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone }),
        weekday: new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone }),
        month: new Intl.DateTimeFormat(locale, {
            month: 'long',
            year: 'numeric',
            timeZone,
        }),
        date: new Intl.DateTimeFormat(locale, {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            timeZone,
        }),
        time: new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit',
            timeZone,
        }),
    }
}

export function getCalendarDateFormatters(locale: CalendarLocale) {
    const intlLocale = locale === 'en' ? 'en-US' : 'de-DE'
    // Resolve once per caller/render, not once per day. Include the current host
    // zone so SSR requests and runtime timezone changes cannot reuse stale rules.
    const timeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
    const key = JSON.stringify([intlLocale, timeZone])
    const cached = cache.get(key)
    if (cached) return cached
    const formatters = createFormatters(intlLocale, timeZone)
    if (cache.size >= 16) cache.delete(cache.keys().next().value!)
    cache.set(key, formatters)
    return formatters
}
