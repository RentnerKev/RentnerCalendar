import type { CalendarValue } from '../../shared/Calendar/Types/Calendar.types.ts'

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

function getDaysInCalendarMonth(year: number, month: number) {
    if (
        month === 1 &&
        year % 4 === 0 &&
        (year % 100 !== 0 || year % 400 === 0)
    ) {
        return 29
    }
    return DAYS_IN_MONTH[month]!
}

export function compareCalendarDays(first: Date, second: Date) {
    const yearDifference = first.getFullYear() - second.getFullYear()
    if (yearDifference !== 0) return yearDifference

    const monthDifference = first.getMonth() - second.getMonth()
    if (monthDifference !== 0) return monthDifference

    return first.getDate() - second.getDate()
}

export function getCalendarDateKey(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const yearStr =
        year >= 1000 && year <= 9999
            ? String(year)
            : String(year).padStart(4, '0')
    return `${yearStr}-${month < 10 ? '0' : ''}${month}-${day < 10 ? '0' : ''}${day}`
}

export function startOfCalendarDay(date: Date) {
    const result = new Date(date.getTime())
    result.setHours(0, 0, 0, 0)
    return result
}

export function endOfCalendarDay(date: Date) {
    const result = new Date(date.getTime())
    result.setHours(23, 59, 59, 999)
    return result
}

export function createCalendarDate(year: number, month: number, day: number) {
    if (year >= 101 || year < 0) {
        return new Date(year, month, day)
    }
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
    const normYear = firstDayOfMonth.getFullYear()
    const normMonth = firstDayOfMonth.getMonth()
    const jsFirstDay = firstDayOfMonth.getDay()
    const isoFirstDay = jsFirstDay === 0 ? 7 : jsFirstDay
    const startingDayIndex = (isoFirstDay - weekStartsOn + 7) % 7
    const daysInMonth = getDaysInCalendarMonth(normYear, normMonth)
    const prevMonth = normMonth === 0 ? 11 : normMonth - 1
    const prevYear = normMonth === 0 ? normYear - 1 : normYear
    const prevMonthDays = getDaysInCalendarMonth(prevYear, prevMonth)
    const nextMonth = normMonth === 11 ? 0 : normMonth + 1
    const nextYear = normMonth === 11 ? normYear + 1 : normYear
    const days: { date: Date; isCurrentMonth: boolean }[] = []
    let col = 0

    for (let index = startingDayIndex - 1; index >= 0; index -= 1) {
        if (col < visibleDays) {
            days.push({
                date: createCalendarDate(
                    prevYear,
                    prevMonth,
                    prevMonthDays - index,
                ),
                isCurrentMonth: false,
            })
        }
        col = col === 6 ? 0 : col + 1
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        if (col < visibleDays) {
            days.push({
                date:
                    day === 1
                        ? firstDayOfMonth
                        : createCalendarDate(normYear, normMonth, day),
                isCurrentMonth: true,
            })
        }
        col = col === 6 ? 0 : col + 1
    }

    const remainingDays = 42 - startingDayIndex - daysInMonth
    for (let day = 1; day <= remainingDays; day += 1) {
        if (col < visibleDays) {
            days.push({
                date: createCalendarDate(nextYear, nextMonth, day),
                isCurrentMonth: false,
            })
        }
        col = col === 6 ? 0 : col + 1
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
    if (!minDate && !maxDate) return true
    if (value instanceof Date) {
        return isCalendarDayWithinBounds(value, minDate, maxDate)
    }
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i += 1) {
            const date = value[i]
            if (
                date instanceof Date &&
                !isCalendarDayWithinBounds(date, minDate, maxDate)
            ) {
                return false
            }
        }
    }
    return true
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
    const targetYear = firstOfTargetMonth.getFullYear()
    const targetMonth = firstOfTargetMonth.getMonth()
    const lastDayOfTargetMonth = getDaysInCalendarMonth(targetYear, targetMonth)

    return createCalendarDate(
        targetYear,
        targetMonth,
        Math.min(date.getDate(), lastDayOfTargetMonth),
    )
}
