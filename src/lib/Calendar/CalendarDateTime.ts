import type {
    CalendarDateInput,
    CalendarValue,
} from '../../shared/Calendar/Types/Calendar.types.ts'
import { parseCalendarDate } from './CalendarValue.ts'
import {
    compareCalendarDays,
    endOfCalendarDay,
    startOfCalendarDay,
} from './CalendarDay.ts'
import {
    calendarValueHasTimeWithinBounds,
    constrainCalendarTime,
} from './CalendarTime.ts'

export function calendarValueWithinDateTimeBounds(
    value: CalendarValue,
    minDateTime?: CalendarDateInput,
    maxDateTime?: CalendarDateInput,
) {
    const min = parseCalendarDate(minDateTime)?.getTime()
    const max = parseCalendarDate(maxDateTime)?.getTime()
    if (min !== undefined && max !== undefined && min > max) return false
    const allowed = (date: Date) =>
        Number.isFinite(date.getTime()) &&
        (min === undefined || date.getTime() >= min) &&
        (max === undefined || date.getTime() <= max)
    return Array.isArray(value)
        ? value.every((date) => date === null || allowed(date))
        : value === undefined || allowed(value)
}

// Choose a valid instant on this local day; never clamp into another day.
export function constrainCalendarDateTime(
    date: Date,
    minDateTime?: CalendarDateInput,
    maxDateTime?: CalendarDateInput,
    minTime?: string,
    maxTime?: string,
): Date | undefined {
    const min = parseCalendarDate(minDateTime)
    const max = parseCalendarDate(maxDateTime)
    if (!min && !max && !minTime && !maxTime)
        return Number.isFinite(date.getTime()) ? date : undefined
    const candidates = [
        date,
        startOfCalendarDay(date),
        endOfCalendarDay(date),
        min,
        max,
    ]
        .filter(
            (candidate): candidate is Date =>
                candidate instanceof Date &&
                compareCalendarDays(candidate, date) === 0,
        )
        .map((candidate) => constrainCalendarTime(candidate, minTime, maxTime))
        .filter(
            (candidate): candidate is Date =>
                candidate !== undefined &&
                calendarValueWithinDateTimeBounds(candidate, min, max) &&
                calendarValueHasTimeWithinBounds(candidate, minTime, maxTime),
        )
    return candidates.toSorted(
        (a, b) =>
            Math.abs(a.getTime() - date.getTime()) -
            Math.abs(b.getTime() - date.getTime()),
    )[0]
}
