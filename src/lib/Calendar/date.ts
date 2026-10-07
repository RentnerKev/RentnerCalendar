import type { CalendarValue } from '../../shared/Calendar/Types/Calendar.types.js'
import { parseCalendarDate, parseCalendarValue } from './CalendarValue.js'

export function toSafeDate(input: unknown): Date | null {
    return parseCalendarDate(input) ?? null
}

export function isSameDay(d1: unknown, d2?: unknown) {
    const safeD1 = toSafeDate(d1)
    const safeD2 = toSafeDate(d2)
    if (!safeD1 || !safeD2) return false

    return (
        safeD1.getDate() === safeD2.getDate() &&
        safeD1.getMonth() === safeD2.getMonth() &&
        safeD1.getFullYear() === safeD2.getFullYear()
    )
}

export function parseToDate(input: unknown): Date | null {
    return parseCalendarDate(input) ?? null
}

export function normalizeValue(val: unknown): CalendarValue {
    return parseCalendarValue(val)
}

export function isToday(date: unknown) {
    const today = new Date()
    return isSameDay(date, today)
}

function calendarDayNumber(year: number, month: number, day: number) {
    const utcDate = new Date(0)
    utcDate.setUTCFullYear(year, month - 1, day)
    utcDate.setUTCHours(0, 0, 0, 0)
    return utcDate.getTime() / (1000 * 60 * 60 * 24)
}

export function getGermanHolidayName(date: unknown): string | null {
    const safeDate = toSafeDate(date)
    if (!safeDate) return null

    const d = safeDate.getDate()
    const m = safeDate.getMonth() + 1
    const y = safeDate.getFullYear()

    if (d === 1 && m === 1) return 'Neujahr'
    if (d === 1 && m === 5) return 'Tag der Arbeit'
    if (d === 3 && m === 10) return 'Tag der Deutschen Einheit'
    if (d === 24 && m === 12) return 'Heiligabend'
    if (d === 25 && m === 12) return '1. Weihnachtstag'
    if (d === 26 && m === 12) return '2. Weihnachtstag'
    if (d === 31 && m === 12) return 'Silvester'

    const a = y % 19
    const b = y % 4
    const c = y % 7
    const k = Math.floor(y / 100)
    const p = Math.floor((13 + 8 * k) / 25)
    const q = Math.floor(k / 4)
    const M = (15 - p + k - q) % 30
    const N = (4 + k - q) % 7
    const d_ostern = (19 * a + M) % 30
    const e = (2 * b + 4 * c + 6 * d_ostern + N) % 7

    let ostern_tag = 22 + d_ostern + e
    let ostern_monat = 3
    if (ostern_tag > 31) {
        ostern_tag = ostern_tag - 31
        ostern_monat = 4
    }
    if (ostern_tag === 26 && ostern_monat === 4) ostern_tag = 19
    if (
        ostern_tag === 25 &&
        ostern_monat === 4 &&
        d_ostern === 28 &&
        e === 6 &&
        a > 10
    )
        ostern_tag = 18

    const diffDays =
        calendarDayNumber(y, m, d) -
        calendarDayNumber(y, ostern_monat, ostern_tag)

    if (diffDays === -2) return 'Karfreitag'
    if (diffDays === 0) return 'Ostersonntag'
    if (diffDays === 1) return 'Ostermontag'
    if (diffDays === 39) return 'Christi Himmelfahrt'
    if (diffDays === 49) return 'Pfingstsonntag'
    if (diffDays === 50) return 'Pfingstmontag'

    return null
}
