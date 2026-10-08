import { getCalendarDateFormatters } from './CalendarDateFormat.ts'
import { toSafeDate } from './date.ts'
import type { CalendarLocale } from './Types/Messages.types.ts'

function formatSingle(
    dateInput: unknown,
    locale: CalendarLocale,
    ignoreEndOfDay = false,
) {
    const date = toSafeDate(dateInput)
    if (!date) return '?'

    const formatters = getCalendarDateFormatters(locale)
    const dateStr = formatters.date.format(date)

    const isEndOfDay =
        date.getHours() === 23 &&
        date.getMinutes() === 59 &&
        date.getSeconds() === 59 &&
        date.getMilliseconds() === 999
    const hasExplicitTime =
        (date.getHours() !== 0 || date.getMinutes() !== 0) &&
        !(ignoreEndOfDay && isEndOfDay)

    if (hasExplicitTime) {
        const timeStr = formatters.time.format(date)
        return `${dateStr} ${timeStr}`
    }
    return dateStr
}

export function formatMonthName(date: unknown, locale: CalendarLocale = 'de') {
    const safeDate = toSafeDate(date) || new Date()
    return getCalendarDateFormatters(locale).month.format(safeDate)
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
    if (value === undefined || value === null || value === '') return ''

    if (Array.isArray(value)) {
        const start = formatSingle(value[0], locale)
        const end = formatSingle(value[1], locale, true)
        if (start === '?' && end === '?') return ''
        return `${start} - ${end}`
    }

    return formatSingle(value, locale)
}
