import { useState } from 'react'
import type { CalendarValue } from '../types.js'
import {
    createCalendarDate,
    getCalendarMonthDays,
    isCalendarDayWithinBounds,
} from '../Tools/CalendarDay.js'
import { completeCalendarRange } from '../Tools/CalendarSelection.js'

export default function useCalendarLogic(
    value?: CalendarValue,
    onChange?: (value: CalendarValue, source: 'date' | 'time') => void,
    enableRange?: boolean,
    enableTime?: boolean,
    weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7 = 1,
    visibleDays: number = 7,
    minDate?: Date,
    maxDate?: Date,
) {
    const [viewDate, setViewDate] = useState(
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

        let newValue: CalendarValue
        if (enableRange) {
            const currentRange = Array.isArray(internalValue)
                ? internalValue
                : [null, null]
            if (!currentRange[0] || (currentRange[0] && currentRange[1])) {
                const newStart = new Date(date)
                if (enableTime && currentRange[0]) {
                    newStart.setHours(
                        currentRange[0].getHours(),
                        currentRange[0].getMinutes(),
                    )
                } else {
                    newStart.setHours(0, 0, 0, 0)
                }
                newValue = [newStart, null]
            } else {
                newValue = completeCalendarRange(
                    currentRange[0],
                    date,
                    Boolean(enableTime),
                    currentRange[1],
                )
            }
        } else {
            newValue = new Date(date)
            if (enableTime && internalValue instanceof Date) {
                newValue.setHours(
                    internalValue.getHours(),
                    internalValue.getMinutes(),
                )
            } else if (!enableTime) {
                newValue.setHours(0, 0, 0, 0)
            }
        }
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
