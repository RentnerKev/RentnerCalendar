import type { CSSProperties } from 'react'
import type { CalendarValue } from '../types.js'

export function toSafeDate(input: unknown): Date | null {
    if (!input) return null
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input
    if (typeof input !== 'string' && typeof input !== 'number') return null
    const parsed = new Date(input)
    return isNaN(parsed.getTime()) ? null : parsed
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
    if (!input) return null
    if (input instanceof Date) return isNaN(input.getTime()) ? null : input

    if (typeof input === 'string') {
        const deMatch = input.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
        if (deMatch) {
            const day = parseInt(deMatch[1], 10)
            const month = parseInt(deMatch[2], 10) - 1
            const year = parseInt(deMatch[3], 10)

            const timeMatch = input.match(/\s(\d{1,2}):(\d{1,2})/)
            if (timeMatch) {
                return new Date(
                    year,
                    month,
                    day,
                    parseInt(timeMatch[1], 10),
                    parseInt(timeMatch[2], 10),
                )
            }
            return new Date(year, month, day)
        }
    }

    if (typeof input !== 'string' && typeof input !== 'number') return null

    const parsed = new Date(input)
    return isNaN(parsed.getTime()) ? null : parsed
}

export function normalizeValue(val: unknown): CalendarValue {
    if (val === undefined || val === null) return undefined
    if (Array.isArray(val)) {
        return [parseToDate(val[0]), parseToDate(val[1])]
    }
    const parsed = parseToDate(val)
    return parsed ? parsed : undefined
}

export function getTooltipStyle(
    index: number,
    visibleDays: number,
): CSSProperties {
    const col = index % visibleDays
    if (col <= 1) {
        return { left: '0', transform: 'none' }
    } else if (col >= visibleDays - 2) {
        return { right: '0', left: 'auto', transform: 'none' }
    }
    return { left: '50%', transform: 'translateX(-50%)' }
}

export function isToday(date: unknown) {
    const today = new Date()
    return isSameDay(date, today)
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

    const ostersonntag = new Date(y, ostern_monat - 1, ostern_tag)
    const diffDays = Math.round(
        (safeDate.getTime() - ostersonntag.getTime()) / (1000 * 60 * 60 * 24),
    )

    if (diffDays === -2) return 'Karfreitag'
    if (diffDays === 0) return 'Ostersonntag'
    if (diffDays === 1) return 'Ostermontag'
    if (diffDays === 39) return 'Christi Himmelfahrt'
    if (diffDays === 49) return 'Pfingstsonntag'
    if (diffDays === 50) return 'Pfingstmontag'

    return null
}

const roundedMap: Record<string, string> = {
    'rounded-sm': '0.125rem',
    'rounded-md': '0.375rem',
    'rounded-lg': '0.5rem',
    'rounded-xl': '0.75rem',
    'rounded-2xl': '1rem',
    'rounded-3xl': '1.5rem',
    'rounded-full': '9999px',
    rounded: '0.25rem',
}

export function extractRadius(className: string): string | null {
    const keys = Object.keys(roundedMap).toSorted((a, b) => b.length - a.length)
    for (const key of keys) {
        if (className.includes(key)) {
            return roundedMap[key]
        }
    }
    return null
}
