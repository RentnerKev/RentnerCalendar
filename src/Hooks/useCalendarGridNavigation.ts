import { useLayoutEffect, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import {
    addCalendarDays,
    addCalendarMonths,
    getCalendarDateKey,
    isCalendarDayWithinBounds,
} from '../Tools/CalendarDay.js'

interface CalendarGridNavigationOptions {
    columnCount: number
    weekStartsOn: number
    currentDate: Date
    initialFocusDate?: Date
    minDate?: Date
    maxDate?: Date
    availabilityKey: string
    isDateSelectable?: (date: Date) => boolean
    onViewDateChange: (date: Date) => void
}

function getTargetDate(
    key: string,
    date: Date,
    columnCount: number,
    weekStartsOn: number,
) {
    switch (key) {
        case 'ArrowLeft':
            return { date: addCalendarDays(date, -1), step: -1, limit: 62 }
        case 'ArrowRight':
            return { date: addCalendarDays(date, 1), step: 1, limit: 62 }
        case 'ArrowUp':
            return { date: addCalendarDays(date, -7), step: -7, limit: 62 }
        case 'ArrowDown':
            return { date: addCalendarDays(date, 7), step: 7, limit: 62 }
        case 'Home': {
            const weekday = (date.getDay() + 6) % 7
            const firstColumn = (weekStartsOn + 6) % 7
            const column = (weekday - firstColumn + 7) % 7
            return {
                date: addCalendarDays(date, -column),
                step: 1,
                limit: columnCount,
            }
        }
        case 'End': {
            const weekday = (date.getDay() + 6) % 7
            const firstColumn = (weekStartsOn + 6) % 7
            const column = (weekday - firstColumn + 7) % 7
            return {
                date: addCalendarDays(date, columnCount - column - 1),
                step: -1,
                limit: columnCount,
            }
        }
        case 'PageUp':
            return {
                date: addCalendarMonths(date, eventMonthOffset(key, 1)),
                step: 1,
                limit: 31,
            }
        case 'PageDown':
            return {
                date: addCalendarMonths(date, eventMonthOffset(key, 1)),
                step: -1,
                limit: 31,
            }
        default:
            return null
    }
}

function eventMonthOffset(key: string, direction: 1 | -1) {
    return (key === 'PageUp' ? -1 : 1) * direction
}

export default function useCalendarGridNavigation({
    columnCount,
    weekStartsOn,
    currentDate,
    initialFocusDate,
    minDate,
    maxDate,
    availabilityKey,
    isDateSelectable,
    onViewDateChange,
}: CalendarGridNavigationOptions) {
    const gridRef = useRef<HTMLDivElement>(null)
    const pendingFocusDateKey = useRef<string | null>(null)
    const focusedDateKey = useRef<string | null>(null)
    const previousAvailabilityKey = useRef(availabilityKey)
    const [activeDateKey, setActiveDateKey] = useState(
        initialFocusDate ? getCalendarDateKey(initialFocusDate) : '',
    )

    function findDayButton(date: Date) {
        return findDayButtonByKey(getCalendarDateKey(date))
    }

    function findDayButtonByKey(dateKey: string) {
        return gridRef.current?.querySelector<HTMLButtonElement>(
            `[data-calendar-date="${dateKey}"]`,
        )
    }

    useLayoutEffect(() => {
        const pendingDateKey = pendingFocusDateKey.current
        if (!pendingDateKey) return

        const target = gridRef.current?.querySelector<HTMLButtonElement>(
            `[data-calendar-date="${pendingDateKey}"]`,
        )
        if (target && !target.disabled) {
            target.focus()
            pendingFocusDateKey.current = null
        } else if (
            currentDate.getFullYear() === Number(pendingDateKey.slice(0, 4)) &&
            currentDate.getMonth() + 1 === Number(pendingDateKey.slice(5, 7))
        ) {
            pendingFocusDateKey.current = null
        }
    }, [currentDate])

    useLayoutEffect(() => {
        const availabilityChanged =
            previousAvailabilityKey.current !== availabilityKey
        previousAvailabilityKey.current = availabilityKey
        if (!availabilityChanged) return

        const previousFocusedDateKey = focusedDateKey.current
        if (!previousFocusedDateKey) return

        const previousFocusedDay = findDayButtonByKey(previousFocusedDateKey)
        if (!previousFocusedDay?.disabled) return

        if (
            document.activeElement !== document.body &&
            document.activeElement !== previousFocusedDay
        ) {
            return
        }

        const nextFocusableDay =
            gridRef.current?.querySelector<HTMLButtonElement>(
                '[data-calendar-day][tabindex="0"]:not(:disabled)',
            )

        if (nextFocusableDay) {
            nextFocusableDay.focus()
        } else {
            gridRef.current?.closest<HTMLElement>('[role="dialog"]')?.focus()
        }
    }, [availabilityKey])

    function focusDate(date: Date) {
        const dateKey = getCalendarDateKey(date)
        setActiveDateKey(dateKey)

        if (
            date.getFullYear() !== currentDate.getFullYear() ||
            date.getMonth() !== currentDate.getMonth()
        ) {
            pendingFocusDateKey.current = dateKey
            onViewDateChange(date)
            return
        }

        findDayButton(date)?.focus()
    }

    function handleDayFocus(date: Date) {
        const dateKey = getCalendarDateKey(date)
        focusedDateKey.current = dateKey
        setActiveDateKey(dateKey)
    }

    function handleDayKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        date: Date,
    ) {
        const key = event.key
        if (event.shiftKey && (key === 'PageUp' || key === 'PageDown')) {
            event.preventDefault()
            let candidate = addCalendarMonths(date, key === 'PageUp' ? -12 : 12)
            const step = key === 'PageUp' ? 1 : -1
            for (let attempt = 0; attempt < 31; attempt += 1) {
                const button = findDayButton(candidate)
                const withinBounds = isCalendarDayWithinBounds(
                    candidate,
                    minDate,
                    maxDate,
                )
                const isSelectable = isDateSelectable?.(candidate) ?? true
                const isOutsideVisibleMonth =
                    candidate.getFullYear() !== currentDate.getFullYear() ||
                    candidate.getMonth() !== currentDate.getMonth()
                const isoWeekday =
                    candidate.getDay() === 0 ? 7 : candidate.getDay()
                const visibleColumn = (isoWeekday - weekStartsOn + 7) % 7

                if (
                    withinBounds &&
                    isSelectable &&
                    ((button && !button.disabled) ||
                        (!button &&
                            isOutsideVisibleMonth &&
                            visibleColumn < columnCount))
                ) {
                    focusDate(candidate)
                    return
                }

                candidate = addCalendarDays(candidate, step)
            }
            return
        }

        const target = getTargetDate(key, date, columnCount, weekStartsOn)
        if (!target) return

        event.preventDefault()

        let candidate = target.date
        for (let attempt = 0; attempt < target.limit; attempt += 1) {
            const button = findDayButton(candidate)
            const withinBounds = isCalendarDayWithinBounds(
                candidate,
                minDate,
                maxDate,
            )
            const isSelectable = isDateSelectable?.(candidate) ?? true
            const isOutsideVisibleMonth =
                candidate.getFullYear() !== currentDate.getFullYear() ||
                candidate.getMonth() !== currentDate.getMonth()
            const isoWeekday = candidate.getDay() === 0 ? 7 : candidate.getDay()
            const visibleColumn = (isoWeekday - weekStartsOn + 7) % 7
            if (
                withinBounds &&
                isSelectable &&
                ((button && !button.disabled) ||
                    (!button &&
                        isOutsideVisibleMonth &&
                        visibleColumn < columnCount))
            ) {
                focusDate(candidate)
                return
            }

            candidate = addCalendarDays(candidate, target.step)
        }
    }

    return {
        gridRef,
        state: { activeDateKey },
        handler: { handleDayKeyDown, handleDayFocus },
    }
}
