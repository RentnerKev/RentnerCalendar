import type {
    CalendarRange,
    CalendarValue,
} from '../../shared/Calendar/Types/Calendar.types.ts'
import {
    compareCalendarDays,
    endOfCalendarDay,
    isCalendarDayWithinBounds,
    startOfCalendarDay,
} from './CalendarDay.ts'
import {
    constrainCalendarTime,
    hasCalendarTimeWithinBounds,
    resolveCalendarSelectionTime,
} from './CalendarTime.ts'

export function completeCalendarRange(
    firstDate: Date,
    secondDate: Date,
    enableTime: boolean,
    endTime?: Date | null,
): CalendarRange {
    if (!enableTime) {
        if (compareCalendarDays(firstDate, secondDate) <= 0) {
            return [startOfCalendarDay(firstDate), endOfCalendarDay(secondDate)]
        }

        return [startOfCalendarDay(secondDate), endOfCalendarDay(firstDate)]
    }

    const firstBoundary = new Date(firstDate)
    const secondBoundary = new Date(secondDate)
    if (endTime) {
        secondBoundary.setHours(endTime.getHours(), endTime.getMinutes())
    } else {
        secondBoundary.setHours(23, 59, 59, 999)
    }

    return secondBoundary < firstBoundary
        ? [secondBoundary, firstBoundary]
        : [firstBoundary, secondBoundary]
}

export function updateCalendarRangeBoundary(
    range: CalendarRange,
    index: 0 | 1,
    date: Date,
): CalendarRange {
    const nextRange: CalendarRange = [...range]
    nextRange[index] = date

    const [start, end] = nextRange
    if (start && end && start.getTime() > end.getTime()) {
        nextRange[index] = new Date(nextRange[1 - index]!)
    }

    return nextRange
}

export function createCalendarDateSelection(
    date: Date,
    currentValue: CalendarValue | undefined,
    options: {
        enableRange?: boolean
        enableTime?: boolean
        minDate?: Date
        maxDate?: Date
        minTime?: string
        maxTime?: string
    } = {},
): CalendarValue {
    const {
        enableRange = false,
        enableTime = false,
        minDate,
        maxDate,
        minTime,
        maxTime,
    } = options

    if (enableTime && !hasCalendarTimeWithinBounds(date, minTime, maxTime)) {
        return currentValue
    }

    if (enableRange) {
        const currentRange = Array.isArray(currentValue)
            ? currentValue
            : [null, null]
        const [start, end] = currentRange
        const validStart =
            start !== null &&
            isCalendarDayWithinBounds(start, minDate, maxDate) &&
            (!enableTime ||
                hasCalendarTimeWithinBounds(start, minTime, maxTime))

        if (!start || end || !validStart) {
            const newStart = new Date(date)
            if (enableTime && start && validStart) {
                const update = resolveCalendarSelectionTime(
                    newStart,
                    `${String(start.getHours()).padStart(2, '0')}${String(start.getMinutes()).padStart(2, '0')}`,
                    minTime,
                    maxTime,
                )

                return update ? [update.date, null] : currentValue
            }

            if (!enableTime) {
                newStart.setHours(0, 0, 0, 0)
            }

            const newStartValue = enableTime
                ? constrainCalendarTime(newStart, minTime, maxTime)
                : newStart

            return newStartValue ? [newStartValue, null] : currentValue
        }

        const rangeStart = enableTime
            ? constrainCalendarTime(new Date(start), minTime, maxTime)
            : start
        if (!rangeStart) return currentValue

        const range = completeCalendarRange(rangeStart, date, enableTime, end)

        if (!enableTime) return range

        const constrainedRange = range.map((boundary) =>
            boundary ? constrainCalendarTime(boundary, minTime, maxTime) : null,
        ) as CalendarRange

        if (
            range.some(
                (boundary, index) => boundary && !constrainedRange[index],
            )
        ) {
            return currentValue
        }

        if (
            constrainedRange[0] &&
            constrainedRange[1] &&
            constrainedRange[0].getTime() > constrainedRange[1].getTime()
        ) {
            return [constrainedRange[1], constrainedRange[0]]
        }

        return constrainedRange
    }

    const selectedDate = new Date(date)
    if (enableTime && currentValue instanceof Date) {
        const update = resolveCalendarSelectionTime(
            selectedDate,
            `${String(currentValue.getHours()).padStart(2, '0')}${String(currentValue.getMinutes()).padStart(2, '0')}`,
            minTime,
            maxTime,
        )

        return update ? update.date : currentValue
    }

    if (!enableTime) {
        selectedDate.setHours(0, 0, 0, 0)
    }

    const selectedDateValue = enableTime
        ? constrainCalendarTime(selectedDate, minTime, maxTime)
        : selectedDate

    return selectedDateValue ?? currentValue
}
