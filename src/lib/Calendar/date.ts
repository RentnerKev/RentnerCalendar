import type { CalendarValue } from '../../shared/Calendar/Types/Calendar.types.ts'
import { parseCalendarDate, parseCalendarValue } from './CalendarValue.ts'

export function asValidDate(input: unknown): Date | null {
    if (input instanceof Date) {
        return Number.isNaN(input.getTime()) ? null : input
    }
    return parseCalendarDate(input) ?? null
}

export function toSafeDate(input: unknown): Date | null {
    return parseCalendarDate(input) ?? null
}

export function isSameDay(d1: unknown, d2?: unknown) {
    const safeD1 = asValidDate(d1)
    if (!safeD1) return false
    const safeD2 = asValidDate(d2)
    if (!safeD2) return false

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

export function getTodayDayNumber() {
    const today = new Date()
    return (
        today.getFullYear() * 10000 + today.getMonth() * 100 + today.getDate()
    )
}

export function isToday(date: unknown) {
    const safeDate = asValidDate(date)
    if (!safeDate) return false
    const today = new Date()
    return (
        safeDate.getDate() === today.getDate() &&
        safeDate.getMonth() === today.getMonth() &&
        safeDate.getFullYear() === today.getFullYear()
    )
}

function calendarDayNumber(year: number, month: number, day: number) {
    const y = year - (month <= 2 ? 1 : 0)
    const era = Math.floor(y / 400)
    const yoe = y - era * 400
    const m = month + (month > 2 ? -3 : 9)
    const doy = Math.floor((153 * m + 2) / 5) + day - 1
    const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy
    return era * 146097 + doe - 719468
}

const easterDayCache = /* @__PURE__ */ new Map<number, number>()

function getEasterDayNumber(y: number) {
    const cached = easterDayCache.get(y)
    if (cached !== undefined) return cached

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
        ostern_tag -= 31
        ostern_monat = 4
    }
    if (ostern_tag === 26 && ostern_monat === 4) ostern_tag = 19
    if (
        ostern_tag === 25 &&
        ostern_monat === 4 &&
        d_ostern === 28 &&
        e === 6 &&
        a > 10
    ) {
        ostern_tag = 18
    }

    const dayNumber = calendarDayNumber(y, ostern_monat, ostern_tag)
    if (easterDayCache.size >= 64) {
        easterDayCache.delete(easterDayCache.keys().next().value!)
    }
    easterDayCache.set(y, dayNumber)
    return dayNumber
}

export function getGermanHolidayName(date: unknown): string | null {
    const safeDate = asValidDate(date)
    if (!safeDate) return null

    const d = safeDate.getDate()
    const m = safeDate.getMonth() + 1

    if (m === 1) return d === 1 ? 'Neujahr' : null
    if (m === 5 && d === 1) return 'Tag der Arbeit'
    if (m === 10) return d === 3 ? 'Tag der Deutschen Einheit' : null
    if (m === 12) {
        if (d === 24) return 'Heiligabend'
        if (d === 25) return '1. Weihnachtstag'
        if (d === 26) return '2. Weihnachtstag'
        if (d === 31) return 'Silvester'
        return null
    }
    if (m < 3 || m > 6) return null

    const y = safeDate.getFullYear()
    const diffDays = calendarDayNumber(y, m, d) - getEasterDayNumber(y)

    if (diffDays === -2) return 'Karfreitag'
    if (diffDays === 0) return 'Ostersonntag'
    if (diffDays === 1) return 'Ostermontag'
    if (diffDays === 39) return 'Christi Himmelfahrt'
    if (diffDays === 49) return 'Pfingstsonntag'
    if (diffDays === 50) return 'Pfingstmontag'

    return null
}
