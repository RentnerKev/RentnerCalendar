import { getCalendarDateFormatters } from './CalendarDateFormat.ts'
import { asValidDate } from './date.ts'
import type { CalendarLocale } from './Types/Messages.types.ts'

function formatSingle(
    dateInput: unknown,
    formatters: ReturnType<typeof getCalendarDateFormatters>,
    ignoreEndOfDay = false,
) {
    const date = asValidDate(dateInput)
    if (!date) return '?'

    const dateStr = formatters.date.format(date)
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const isEndOfDay =
        hours === 23 &&
        minutes === 59 &&
        date.getSeconds() === 59 &&
        date.getMilliseconds() === 999
    const hasExplicitTime =
        (hours !== 0 || minutes !== 0) && !(ignoreEndOfDay && isEndOfDay)

    if (hasExplicitTime) {
        return `${dateStr} ${formatters.time.format(date)}`
    }
    return dateStr
}

export function formatMonthName(date: unknown, locale: CalendarLocale = 'de') {
    const safeDate = asValidDate(date) ?? new Date()
    return getCalendarDateFormatters(locale).month.format(safeDate)
}

export function formatTimeToString(date: unknown) {
    const safeDate = asValidDate(date)
    if (!safeDate) return '0000'

    const h = safeDate.getHours()
    const m = safeDate.getMinutes()
    return `${h < 10 ? '0' : ''}${h}${m < 10 ? '0' : ''}${m}`
}

export function formatCalendarValue(
    value?: unknown,
    locale: CalendarLocale = 'de',
): string {
    if (value === undefined || value === null || value === '') return ''

    const formatters = getCalendarDateFormatters(locale)
    if (Array.isArray(value)) {
        const start = formatSingle(value[0], formatters)
        const end = formatSingle(value[1], formatters, true)
        if (start === '?' && end === '?') return ''
        return `${start} - ${end}`
    }

    return formatSingle(value, formatters)
}
