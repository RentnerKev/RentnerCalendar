import type {
    CalendarDateRestrictions,
    CalendarValue,
} from '../../shared/Calendar/Types/Calendar.types.ts'
import {
    addCalendarDays,
    compareCalendarDays,
    startOfCalendarDay,
} from './CalendarDay.ts'

export function isCalendarDateDisabled(
    date: Date,
    restrictions: CalendarDateRestrictions,
): boolean {
    const weekday = (date.getDay() || 7) as 1 | 2 | 3 | 4 | 5 | 6 | 7
    return (
        restrictions.disabledWeekdays?.includes(weekday) === true ||
        restrictions.isDateDisabled?.(startOfCalendarDay(date)) === true
    )
}

/** A range is selectable only when every included calendar day is available. */
export function calendarValueAllowsDates(
    value: CalendarValue,
    restrictions: CalendarDateRestrictions,
): boolean {
    if (!restrictions.isDateDisabled && !restrictions.disabledWeekdays?.length)
        return true
    if (value instanceof Date)
        return !isCalendarDateDisabled(value, restrictions)
    if (!value) return true
    const [start, end] = value
    if (!start || !end)
        return value.every(
            (date) => !date || !isCalendarDateDisabled(date, restrictions),
        )
    let day = startOfCalendarDay(start < end ? start : end)
    const last = start < end ? end : start
    while (compareCalendarDays(day, last) <= 0) {
        if (isCalendarDateDisabled(day, restrictions)) return false
        day = addCalendarDays(day, 1)
    }
    return true
}
