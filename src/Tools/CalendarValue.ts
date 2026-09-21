import type {
    CalendarInputValue,
    CalendarRange,
    CalendarValue,
    RangeCalendarInputValue,
    RangeCalendarValue,
    SingleCalendarInputValue,
    SingleCalendarValue,
} from '../types.js'

const isoDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/
const localIsoDateTimePattern =
    /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/
const zonedIsoDateTimePattern =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?(Z|([+-])(\d{2}):(\d{2}))$/i
const germanDatePattern =
    /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/

export type CalendarSerializationFormat = 'date' | 'datetime'

export interface SerializeCalendarValueOptions {
    format?: CalendarSerializationFormat
}

export type SerializedCalendarRange = [string | null, string | null]
export type SerializedSingleCalendarValue = string | undefined
export type SerializedRangeCalendarValue = SerializedCalendarRange | undefined
export type SerializedCalendarValue =
    | SerializedSingleCalendarValue
    | SerializedRangeCalendarValue

function isLeapYear(year: number) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

function isValidDateParts(year: number, month: number, day: number) {
    const daysByMonth = [
        31,
        isLeapYear(year) ? 29 : 28,
        31,
        30,
        31,
        30,
        31,
        31,
        30,
        31,
        30,
        31,
    ]

    return (
        month >= 1 && month <= 12 && day >= 1 && day <= daysByMonth[month - 1]
    )
}

function parseMilliseconds(value: string | undefined) {
    return value ? Number(value.padEnd(3, '0')) : 0
}

function createLocalDate(
    year: number,
    month: number,
    day: number,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0,
) {
    if (
        !isValidDateParts(year, month, day) ||
        hour < 0 ||
        hour > 23 ||
        minute < 0 ||
        minute > 59 ||
        second < 0 ||
        second > 59 ||
        millisecond < 0 ||
        millisecond > 999
    ) {
        return undefined
    }

    const date = new Date(0)
    date.setFullYear(year, month - 1, day)
    date.setHours(hour, minute, second, millisecond)

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day ||
        date.getHours() !== hour ||
        date.getMinutes() !== minute ||
        date.getSeconds() !== second ||
        date.getMilliseconds() !== millisecond
    ) {
        return undefined
    }

    return date
}

function isValidDate(value: unknown): value is Date {
    return value instanceof Date && !Number.isNaN(value.getTime())
}

export function parseCalendarISODate(value: string) {
    const match = isoDatePattern.exec(value.trim())
    if (!match) return undefined

    return createLocalDate(Number(match[1]), Number(match[2]), Number(match[3]))
}

export function serializeCalendarISODate(
    value: Date | null | undefined,
): string | undefined {
    if (!isValidDate(value)) return undefined

    const year = value.getFullYear()
    if (year < 0 || year > 9999) return undefined

    const month = String(value.getMonth() + 1).padStart(2, '0')
    const day = String(value.getDate()).padStart(2, '0')
    return `${String(year).padStart(4, '0')}-${month}-${day}`
}

export function parseCalendarISOString(value: string) {
    const trimmedValue = value.trim()
    const match = zonedIsoDateTimePattern.exec(trimmedValue)
    if (!match) return undefined

    const year = Number(match[1])
    const month = Number(match[2])
    const day = Number(match[3])
    const hour = Number(match[4])
    const minute = Number(match[5])
    const second = Number(match[6] ?? 0)
    const millisecond = parseMilliseconds(match[7])
    const offsetHour = Number(match[10] ?? 0)
    const offsetMinute = Number(match[11] ?? 0)

    if (
        !isValidDateParts(year, month, day) ||
        hour > 23 ||
        minute > 59 ||
        second > 59 ||
        millisecond > 999 ||
        offsetHour > 23 ||
        offsetMinute > 59
    ) {
        return undefined
    }

    const date = new Date(trimmedValue)
    return isValidDate(date) ? date : undefined
}

export function serializeCalendarISOString(
    value: Date | null | undefined,
): string | undefined {
    return isValidDate(value) ? value.toISOString() : undefined
}

function parseLocalISODateTime(value: string) {
    const match = localIsoDateTimePattern.exec(value)
    if (!match) return undefined

    return createLocalDate(
        Number(match[1]),
        Number(match[2]),
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
        Number(match[6] ?? 0),
        parseMilliseconds(match[7]),
    )
}

function parseGermanDate(value: string) {
    const match = germanDatePattern.exec(value)
    if (!match) return undefined

    return createLocalDate(
        Number(match[3]),
        Number(match[2]),
        Number(match[1]),
        Number(match[4] ?? 0),
        Number(match[5] ?? 0),
        Number(match[6] ?? 0),
        parseMilliseconds(match[7]),
    )
}

export function parseCalendarDate(value: unknown): Date | undefined {
    if (value === null || value === undefined) return undefined
    if (value instanceof Date) {
        return isValidDate(value) ? new Date(value.getTime()) : undefined
    }

    if (typeof value === 'number') {
        const date = new Date(value)
        return isValidDate(date) ? date : undefined
    }

    if (typeof value !== 'string') return undefined

    const trimmedValue = value.trim()
    if (!trimmedValue) return undefined

    if (isoDatePattern.test(trimmedValue)) {
        return parseCalendarISODate(trimmedValue)
    }
    if (zonedIsoDateTimePattern.test(trimmedValue)) {
        return parseCalendarISOString(trimmedValue)
    }
    if (localIsoDateTimePattern.test(trimmedValue)) {
        return parseLocalISODateTime(trimmedValue)
    }
    if (germanDatePattern.test(trimmedValue)) {
        return parseGermanDate(trimmedValue)
    }

    const date = new Date(trimmedValue)
    return isValidDate(date) ? date : undefined
}

export function parseCalendarValue(
    value: SingleCalendarInputValue,
): SingleCalendarValue
export function parseCalendarValue(
    value: RangeCalendarInputValue,
): RangeCalendarValue
export function parseCalendarValue(value: CalendarInputValue): CalendarValue
export function parseCalendarValue(value: unknown): CalendarValue
export function parseCalendarValue(value: unknown): CalendarValue {
    if (value === null || value === undefined) return undefined

    if (Array.isArray(value)) {
        if (value.length !== 2) return undefined

        return [
            parseCalendarDate(value[0]) ?? null,
            parseCalendarDate(value[1]) ?? null,
        ]
    }

    return parseCalendarDate(value)
}

export function isCalendarRange(value: unknown): value is CalendarRange {
    return (
        Array.isArray(value) &&
        value.length === 2 &&
        value.every((boundary) => boundary === null || isValidDate(boundary))
    )
}

export function serializeCalendarValue(
    value: CalendarRange,
    options?: SerializeCalendarValueOptions,
): SerializedCalendarRange
export function serializeCalendarValue(
    value: SingleCalendarValue,
    options?: SerializeCalendarValueOptions,
): SerializedSingleCalendarValue
export function serializeCalendarValue(
    value: RangeCalendarValue,
    options?: SerializeCalendarValueOptions,
): SerializedRangeCalendarValue
export function serializeCalendarValue(
    value: CalendarValue,
    options?: SerializeCalendarValueOptions,
): SerializedCalendarValue
export function serializeCalendarValue(
    value: CalendarValue,
    { format = 'datetime' }: SerializeCalendarValueOptions = {},
): SerializedCalendarValue {
    if (value === undefined) return undefined

    const serializeDate =
        format === 'date'
            ? serializeCalendarISODate
            : serializeCalendarISOString

    if (Array.isArray(value)) {
        return [
            serializeDate(value[0]) ?? null,
            serializeDate(value[1]) ?? null,
        ]
    }

    return serializeDate(value)
}
