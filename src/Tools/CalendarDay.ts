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

export function addCalendarDays(date: Date, days: number) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

export function addCalendarMonths(date: Date, months: number) {
    const firstOfTargetMonth = new Date(
        date.getFullYear(),
        date.getMonth() + months,
        1,
    )
    const lastDayOfTargetMonth = new Date(
        firstOfTargetMonth.getFullYear(),
        firstOfTargetMonth.getMonth() + 1,
        0,
    ).getDate()

    return new Date(
        firstOfTargetMonth.getFullYear(),
        firstOfTargetMonth.getMonth(),
        Math.min(date.getDate(), lastDayOfTargetMonth),
    )
}
