import type { CalendarRange } from '../types.js'
import {
    compareCalendarDays,
    endOfCalendarDay,
    startOfCalendarDay,
} from './CalendarDay.js'

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
