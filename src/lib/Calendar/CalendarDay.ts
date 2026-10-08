import type { CalendarValue } from '../../shared/Calendar/Types/Calendar.types.ts'

export function compareCalendarDays(first: Date, second: Date) {
    const yearDifference = first.getFullYear() - second.getFullYear()
    if (yearDifference !== 0) return yearDifference

    const monthDifference = first.getMonth() - second.getMonth()
    if (monthDifference !== 0) return monthDifference

    return first.getDate() - second.getDate()
}

export function getCalendarDateKey(date: Date) {
    const year = String(date.getFullYear()).padStart(4, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function startOfCalendarDay(date: Date) {
    const result = new Date(date)
    result.setHours(0, 0, 0, 0)
    return result
}

export function endOfCalendarDay(date: Date) {
    const result = new Date(date)
    result.setHours(23, 59, 59, 999)
    return result
}

export function createCalendarDate(year: number, month: number, day: number) {
    const result = new Date(0)
    result.setFullYear(year, month, day)
    result.setHours(0, 0, 0, 0)
    return result
}

export function getCalendarMonthDays(
    year: number,
    month: number,
    weekStartsOn: number,
    visibleDays: number,
) {
    const firstDayOfMonth = createCalendarDate(year, month, 1)
    const jsFirstDay = firstDayOfMonth.getDay()
    const isoFirstDay = jsFirstDay === 0 ? 7 : jsFirstDay
    const startingDayIndex = (isoFirstDay - weekStartsOn + 7) % 7
    const daysInMonth = createCalendarDate(year, month + 1, 0).getDate()
    const days: { date: Date; isCurrentMonth: boolean }[] = []
    const prevMonthDays = createCalendarDate(year, month, 0).getDate()

    for (let index = startingDayIndex - 1; index >= 0; index -= 1) {
        days.push({
            date: createCalendarDate(year, month - 1, prevMonthDays - index),
            isCurrentMonth: false,
        })
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        days.push({
            date: createCalendarDate(year, month, day),
            isCurrentMonth: true,
        })
    }

    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day += 1) {
        days.push({
            date: createCalendarDate(year, month + 1, day),
            isCurrentMonth: false,
        })
    }

    if (visibleDays < 7) {
        return days.filter(({ date }) => {
            const jsDay = date.getDay()
            const isoDay = jsDay === 0 ? 7 : jsDay
            const relativeDay = (isoDay - weekStartsOn + 7) % 7
            return relativeDay < visibleDays
        })
    }

    return days
}

export function isCalendarDayWithinBounds(
    date: Date,
    minDate?: Date,
    maxDate?: Date,
) {
    return (
        (!minDate || compareCalendarDays(date, minDate) >= 0) &&
        (!maxDate || compareCalendarDays(date, maxDate) <= 0)
    )
}

export function calendarValueWithinDateBounds(
    value: CalendarValue | undefined,
    minDate?: Date,
    maxDate?: Date,
) {
    const dates =
        value instanceof Date
            ? [value]
            : Array.isArray(value)
              ? value.filter((date): date is Date => date instanceof Date)
              : []

    return dates.every((date) =>
        isCalendarDayWithinBounds(date, minDate, maxDate),
    )
}

export function addCalendarDays(date: Date, days: number) {
    return createCalendarDate(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + days,
    )
}

export function addCalendarMonths(date: Date, months: number) {
    const firstOfTargetMonth = createCalendarDate(
        date.getFullYear(),
        date.getMonth() + months,
        1,
    )
    const lastDayOfTargetMonth = createCalendarDate(
        firstOfTargetMonth.getFullYear(),
        firstOfTargetMonth.getMonth() + 1,
        0,
    ).getDate()

    return createCalendarDate(
        firstOfTargetMonth.getFullYear(),
        firstOfTargetMonth.getMonth(),
        Math.min(date.getDate(), lastDayOfTargetMonth),
    )
}
