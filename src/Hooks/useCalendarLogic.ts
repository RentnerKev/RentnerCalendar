import { useState } from 'react'
import type { CalendarValue } from '../types.js'

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

    function handlePrevMonth() {
        setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1),
        )
    }

    function handleNextMonth() {
        setViewDate(
            new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1),
        )
    }

    function handleViewDateChange(date: Date) {
        setViewDate(new Date(date.getFullYear(), date.getMonth(), 1))
    }

    function handleGetDaysInMonth() {
        const year = viewDate.getFullYear()
        const month = viewDate.getMonth()
        const firstDayOfMonth = new Date(year, month, 1)

        const jsFirstDay = firstDayOfMonth.getDay()
        const isoFirstDay = jsFirstDay === 0 ? 7 : jsFirstDay

        const startingDayIndex = (isoFirstDay - weekStartsOn + 7) % 7
        const daysInMonth = new Date(year, month + 1, 0).getDate()

        let days = []
        const prevMonthDays = new Date(year, month, 0).getDate()

        for (let i = startingDayIndex - 1; i >= 0; i--) {
            days.push({
                date: new Date(year, month - 1, prevMonthDays - i),
                isCurrentMonth: false,
            })
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                date: new Date(year, month, i),
                isCurrentMonth: true,
            })
        }

        const remainingDays = 42 - days.length
        for (let i = 1; i <= remainingDays; i++) {
            days.push({
                date: new Date(year, month + 1, i),
                isCurrentMonth: false,
            })
        }

        if (visibleDays < 7) {
            days = days.filter((d) => {
                const jsDay = d.date.getDay()
                const isoDay = jsDay === 0 ? 7 : jsDay
                const relDay = (isoDay - weekStartsOn + 7) % 7
                return relDay < visibleDays
            })
        }

        return days
    }

    function handleDateSelect(date: Date) {
        if (
            minDate &&
            new Date(date).setHours(0, 0, 0, 0) <
                new Date(minDate).setHours(0, 0, 0, 0)
        )
            return
        if (
            maxDate &&
            new Date(date).setHours(23, 59, 59, 999) >
                new Date(maxDate).setHours(23, 59, 59, 999)
        )
            return

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
                const start = new Date(currentRange[0])
                const end = new Date(date)
                if (enableTime && currentRange[1]) {
                    end.setHours(
                        currentRange[1].getHours(),
                        currentRange[1].getMinutes(),
                    )
                } else {
                    end.setHours(23, 59, 59, 999)
                }
                if (end < start) {
                    newValue = [end, start]
                } else {
                    newValue = [start, end]
                }
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
