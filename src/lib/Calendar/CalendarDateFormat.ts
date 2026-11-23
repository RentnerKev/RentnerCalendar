import type { CalendarLocale } from './Types/Messages.types.ts'

interface CalendarDateFormatters {
    readonly full: Intl.DateTimeFormat
    readonly weekday: Intl.DateTimeFormat
    readonly month: Intl.DateTimeFormat
    readonly date: Intl.DateTimeFormat
    readonly time: Intl.DateTimeFormat
}

const cache = /* @__PURE__ */ new Map<string, CalendarDateFormatters>()

let cachedTzEnv: string | undefined
let cachedJanOffset = Number.NaN
let cachedJulOffset = Number.NaN
let cachedTimeZone = ''

function getHostTimeZone() {
    const tzEnv = (
        globalThis as { process?: { env?: Record<string, string | undefined> } }
    ).process?.env?.TZ
    const janOffset = new Date(2024, 0, 1).getTimezoneOffset()
    const julOffset = new Date(2024, 6, 1).getTimezoneOffset()
    if (
        cachedTimeZone &&
        tzEnv === cachedTzEnv &&
        janOffset === cachedJanOffset &&
        julOffset === cachedJulOffset
    ) {
        return cachedTimeZone
    }
    cachedTzEnv = tzEnv
    cachedJanOffset = janOffset
    cachedJulOffset = julOffset
    cachedTimeZone = new Intl.DateTimeFormat().resolvedOptions().timeZone
    return cachedTimeZone
}

function createFormatters(
    locale: string,
    timeZone: string,
): CalendarDateFormatters {
    let full: Intl.DateTimeFormat | undefined
    let weekday: Intl.DateTimeFormat | undefined
    let month: Intl.DateTimeFormat | undefined
    let date: Intl.DateTimeFormat | undefined
    let time: Intl.DateTimeFormat | undefined
    return {
        get full() {
            return (full ??= new Intl.DateTimeFormat(locale, {
                dateStyle: 'full',
                timeZone,
            }))
        },
        get weekday() {
            return (weekday ??= new Intl.DateTimeFormat(locale, {
                weekday: 'long',
                timeZone,
            }))
        },
        get month() {
            return (month ??= new Intl.DateTimeFormat(locale, {
                month: 'long',
                year: 'numeric',
                timeZone,
            }))
        },
        get date() {
            return (date ??= new Intl.DateTimeFormat(locale, {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                timeZone,
            }))
        },
        get time() {
            return (time ??= new Intl.DateTimeFormat(locale, {
                hour: '2-digit',
                minute: '2-digit',
                timeZone,
            }))
        },
    }
}

export function getCalendarDateFormatters(locale: CalendarLocale) {
    const intlLocale = locale === 'en' ? 'en-US' : 'de-DE'
    // Resolve once per caller/render, not once per day. Include the current host
    // zone so SSR requests and runtime timezone changes cannot reuse stale rules.
    const timeZone = getHostTimeZone()
    const key = `${intlLocale}\0${timeZone}`
    const cached = cache.get(key)
    if (cached) return cached
    const formatters = createFormatters(intlLocale, timeZone)
    if (cache.size >= 16) cache.delete(cache.keys().next().value!)
    cache.set(key, formatters)
    return formatters
}
