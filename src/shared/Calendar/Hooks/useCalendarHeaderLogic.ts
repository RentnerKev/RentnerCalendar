import { useCallback, useMemo } from 'react'
import type { CalendarHeaderLogicResult } from '../Types/CalendarHeaderLogicResult.types.ts'
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.ts'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.ts'
import { createCalendarDate } from '../../../lib/Calendar/CalendarDay.ts'
import type {
    CalendarHeaderInternalProps,
    FastEditOption,
} from '../Types/CalendarHeader.types.ts'

function getYearOptions(currentYear: number): FastEditOption[] {
    const startYear = currentYear - 50
    const options: FastEditOption[] = []
    for (let index = 0; index < 101; index += 1) {
        const year = String(startYear + index)
        options.push({ value: year, label: year })
    }
    return options
}

export default function useCalendarHeaderLogic({
    currentDate,
    onViewDateChange,
    customDesign = defaultCalendarDesign,
    messages: providedMessages,
}: CalendarHeaderInternalProps): CalendarHeaderLogicResult {
    const cd = useMemo(
        () =>
            customDesign === defaultCalendarDesign
                ? defaultCalendarDesign
                : { ...defaultCalendarDesign, ...customDesign },
        [customDesign],
    )
    const messages = providedMessages ?? resolveCalendarMessages()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const monthOptions = useMemo<FastEditOption[]>(
        () =>
            messages.months.map((label, month) => ({
                value: String(month),
                label,
            })),
        [messages.months],
    )
    const yearOptions = useMemo(
        () => getYearOptions(currentYear),
        [currentYear],
    )

    const handleMonthChange = useCallback(
        (value: string) => {
            onViewDateChange(createCalendarDate(currentYear, Number(value), 1))
        },
        [currentYear, onViewDateChange],
    )

    const handleYearChange = useCallback(
        (value: string) => {
            onViewDateChange(createCalendarDate(Number(value), currentMonth, 1))
        },
        [currentMonth, onViewDateChange],
    )

    return {
        state: {
            cd,
            messages,
            currentMonth,
            currentYear,
            monthOptions,
            yearOptions,
        },
        handler: { handleMonthChange, handleYearChange },
    }
}
