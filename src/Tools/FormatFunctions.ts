import { toSafeDate } from './InternalOnlyFunctions.js'
import type { CalendarLocale } from '../messages.js'

function formatSingle(dateInput: unknown, locale: CalendarLocale) {
    const date = toSafeDate(dateInput)
    if (!date) return '?'

    const dateStr = date.toLocaleDateString(
        locale === 'en' ? 'en-US' : 'de-DE',
        {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        },
    )

    const hasExplicitTime = date.getHours() !== 0 || date.getMinutes() !== 0

    if (hasExplicitTime) {
        const timeStr = date.toLocaleTimeString(
            locale === 'en' ? 'en-US' : 'de-DE',
            {
                hour: '2-digit',
                minute: '2-digit',
            },
        )
        return `${dateStr} ${timeStr}`
    }
    return dateStr
}

export function formatMonthName(date: unknown, locale: CalendarLocale = 'de') {
    const safeDate = toSafeDate(date) || new Date()
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'de-DE', {
        month: 'long',
        year: 'numeric',
    }).format(safeDate)
}

export function formatTimeToString(date: unknown) {
    const safeDate = toSafeDate(date)
    if (!safeDate) return '0000'

    const h = safeDate.getHours().toString().padStart(2, '0')
    const m = safeDate.getMinutes().toString().padStart(2, '0')
    return `${h}${m}`
}

export function formatCalendarValue(
    value?: unknown,
    locale: CalendarLocale = 'de',
): string {
    if (!value) return ''

    if (Array.isArray(value)) {
        const start = formatSingle(value[0], locale)
        const end = formatSingle(value[1], locale)
        if (start === '?' && end === '?') return ''
        return `${start} - ${end}`
    }

    return formatSingle(value, locale)
}
