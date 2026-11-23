import type {
    CalendarDateInput,
    CalendarValue,
} from '../../shared/Calendar/Types/Calendar.types.ts'
import { asValidDate } from './date.ts'
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
    const min =
        minDateTime !== undefined
            ? asValidDate(minDateTime)?.getTime()
            : undefined
    const max =
        maxDateTime !== undefined
            ? asValidDate(maxDateTime)?.getTime()
            : undefined
    if (min !== undefined && max !== undefined && min > max) return false
    if (value === undefined) return true
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i += 1) {
            const date = value[i]
            if (date === null) continue
            const time = date.getTime()
            if (
                !Number.isFinite(time) ||
                (min !== undefined && time < min) ||
                (max !== undefined && time > max)
            ) {
                return false
            }
        }
        return true
    }
    const time = value.getTime()
    return (
        Number.isFinite(time) &&
        (min === undefined || time >= min) &&
        (max === undefined || time <= max)
    )
}

// Choose a valid instant on this local day; never clamp into another day.
export function constrainCalendarDateTime(
    date: Date,
    minDateTime?: CalendarDateInput,
    maxDateTime?: CalendarDateInput,
    minTime?: string,
    maxTime?: string,
): Date | undefined {
    const dateTime = date.getTime()
    if (!Number.isFinite(dateTime)) return undefined
    const min = minDateTime !== undefined ? asValidDate(minDateTime) : null
    const max = maxDateTime !== undefined ? asValidDate(maxDateTime) : null
    if (!min && !max && !minTime && !maxTime) return date

    const minMs = min?.getTime()
    const maxMs = max?.getTime()
    if (minMs !== undefined && maxMs !== undefined && minMs > maxMs) {
        return undefined
    }
    if (min && compareCalendarDays(date, min) < 0) return undefined
    if (max && compareCalendarDays(date, max) > 0) return undefined

    if (
        (minMs === undefined || dateTime >= minMs) &&
        (maxMs === undefined || dateTime <= maxMs) &&
        (!minTime && !maxTime
            ? true
            : calendarValueHasTimeWithinBounds(date, minTime, maxTime))
    ) {
        return date
    }

    let best: Date | undefined
    let bestDiff = Number.POSITIVE_INFINITY
    const consider = (candidate: Date | null) => {
        if (!candidate || compareCalendarDays(candidate, date) !== 0) return
        const constrained = constrainCalendarTime(candidate, minTime, maxTime)
        if (!constrained) return
        const time = constrained.getTime()
        if (
            !Number.isFinite(time) ||
            (minMs !== undefined && time < minMs) ||
            (maxMs !== undefined && time > maxMs) ||
            ((minTime || maxTime) &&
                !calendarValueHasTimeWithinBounds(
                    constrained,
                    minTime,
                    maxTime,
                ))
        ) {
            return
        }
        const diff = Math.abs(time - dateTime)
        if (diff < bestDiff) {
            bestDiff = diff
            best = constrained
        }
    }

    consider(date)
    consider(startOfCalendarDay(date))
    consider(endOfCalendarDay(date))
    consider(min)
    consider(max)
    return best
}
