import type {
    CalendarDateRestrictions,
    CalendarValue,
} from '../../shared/Calendar/Types/Calendar.types.ts'
import {
    addCalendarDays,
    compareCalendarDays,
    startOfCalendarDay,
} from './CalendarDay.ts'

export function buildDisabledWeekdayMask(
    disabledWeekdays?: ReadonlyArray<1 | 2 | 3 | 4 | 5 | 6 | 7>,
): number {
    if (!disabledWeekdays?.length) return 0
    let mask = 0
    for (let i = 0; i < disabledWeekdays.length; i += 1) {
        mask |= 1 << disabledWeekdays[i]!
    }
    return mask
}

export function isCalendarDateDisabled(
    date: Date,
    restrictions: CalendarDateRestrictions,
): boolean {
    const disabledWeekdays = restrictions.disabledWeekdays
    if (disabledWeekdays && disabledWeekdays.length > 0) {
        const weekday = (date.getDay() || 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7
        if (disabledWeekdays.includes(weekday)) return true
    }
    return restrictions.isDateDisabled?.(startOfCalendarDay(date)) === true
}

/** A range is selectable only when every included calendar day is available. */
export function calendarValueAllowsDates(
    value: CalendarValue,
    restrictions: CalendarDateRestrictions,
): boolean {
    const weekdayMask = buildDisabledWeekdayMask(restrictions.disabledWeekdays)
    const predicate = restrictions.isDateDisabled
    if (!predicate && weekdayMask === 0) return true
    if (value instanceof Date) {
        if (
            weekdayMask !== 0 &&
            (weekdayMask & (1 << (value.getDay() || 7))) !== 0
        ) {
            return false
        }
        return !predicate || predicate(startOfCalendarDay(value)) !== true
    }
    if (!value) return true
    const [start, end] = value
    if (!start || !end) {
        const present = start ?? end
        if (!present) return true
        if (
            weekdayMask !== 0 &&
            (weekdayMask & (1 << (present.getDay() || 7))) !== 0
        ) {
            return false
        }
        return !predicate || predicate(startOfCalendarDay(present)) !== true
    }
    const first = start < end ? start : end
    const last = start < end ? end : start
    // Any range spanning at least 7 calendar days includes every weekday 1..7.
    if (weekdayMask !== 0) {
        const approxDays =
            (Date.UTC(last.getFullYear(), last.getMonth(), last.getDate()) -
                Date.UTC(
                    first.getFullYear(),
                    first.getMonth(),
                    first.getDate(),
                )) /
            86_400_000
        if (approxDays >= 6) return false
    }
    let day = startOfCalendarDay(first)
    while (compareCalendarDays(day, last) <= 0) {
        if (
            (weekdayMask !== 0 &&
                (weekdayMask & (1 << (day.getDay() || 7))) !== 0) ||
            (predicate && predicate(day) === true)
        ) {
            return false
        }
        day = addCalendarDays(day, 1)
    }
    return true
}
