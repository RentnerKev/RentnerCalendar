import { useState } from 'react'
import type { CalendarValue } from '../Types/Calendar.types.ts'
import {
    createCalendarDate,
    getCalendarMonthDays,
    isCalendarDayWithinBounds,
} from '../../../lib/Calendar/CalendarDay.ts'
import { createCalendarDateSelection } from '../../../lib/Calendar/CalendarSelection.ts'
import { hasCalendarTimeWithinBounds } from '../../../lib/Calendar/CalendarTime.ts'

export default function useCalendarSelection(
    value?: CalendarValue,
    onChange?: (value: CalendarValue, source: 'date' | 'time') => void,
    enableRange?: boolean,
    enableTime?: boolean,
    weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7 = 1,
    visibleDays: number = 7,
    minDate?: Date,
    maxDate?: Date,
    minTime?: string,
    maxTime?: string,
) {
    const [viewDate, setViewDate] = useState(() =>
        Array.isArray(value) && value[0]
            ? value[0]
            : value instanceof Date
              ? value
              : new Date(),
    )
    const internalValue = value
    const selectedDate =
        Array.isArray(value) && value[0]
            ? value[0]
            : value instanceof Date
              ? value
              : undefined
    const selectedMonthKey = selectedDate
        ? `${selectedDate.getFullYear()}-${selectedDate.getMonth()}`
        : ''
    const [previousSelectedMonthKey, setPreviousSelectedMonthKey] =
        useState(selectedMonthKey)

    if (previousSelectedMonthKey !== selectedMonthKey) {
        setPreviousSelectedMonthKey(selectedMonthKey)

        if (selectedDate) {
            setViewDate(
                createCalendarDate(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    1,
                ),
            )
        }
    }

    function handlePrevMonth() {
        setViewDate(
            createCalendarDate(
                viewDate.getFullYear(),
                viewDate.getMonth() - 1,
                1,
            ),
        )
    }

    function handleNextMonth() {
        setViewDate(
            createCalendarDate(
                viewDate.getFullYear(),
                viewDate.getMonth() + 1,
                1,
            ),
        )
    }

    function handleViewDateChange(date: Date) {
        setViewDate(createCalendarDate(date.getFullYear(), date.getMonth(), 1))
    }

    function handleGetDaysInMonth() {
        return getCalendarMonthDays(
            viewDate.getFullYear(),
            viewDate.getMonth(),
            weekStartsOn,
            visibleDays,
        )
    }

    function handleDateSelect(date: Date) {
        if (!isCalendarDayWithinBounds(date, minDate, maxDate)) return
        if (
            enableTime &&
            !hasCalendarTimeWithinBounds(date, minTime, maxTime)
        ) {
            return
        }

        const newValue = createCalendarDateSelection(date, internalValue, {
            enableRange,
            enableTime,
            minDate,
            maxDate,
            minTime,
            maxTime,
        })
        onChange?.(newValue, 'date')
    }

    function handleTimeChange(newValue: CalendarValue) {
        onChange?.(newValue, 'time')
    }

    return {
        state: {
            viewDate,
            internalValue,
        },
        handler: {
            handlePrevMonth,
            handleNextMonth,
            handleViewDateChange,
            handleDateSelect,
            handleGetDaysInMonth,
            handleTimeChange,
        },
        setter: {
            setViewDate,
        },
    }
}
