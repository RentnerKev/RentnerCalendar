import type { CalendarHeaderLogicResult } from '../Types/CalendarHeaderLogicResult.types.ts'
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.ts'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.ts'
import { createCalendarDate } from '../../../lib/Calendar/CalendarDay.ts'
import { useMemo, useState } from 'react'
import type {
    CalendarHeaderInternalProps,
    FastEditOption,
} from '../Types/CalendarHeader.types.ts'
function getYearOptions(currentYear: number): FastEditOption[] {
    const startYear = currentYear - 50
    return Array.from({ length: 101 }, (_, index) => {
        const year = startYear + index
        return {
            value: year.toString(),
            label: year.toString(),
        }
    })
}

function getMonthOptions(labels: readonly string[]): FastEditOption[] {
    return labels.map((label, month) => ({ value: month.toString(), label }))
}

function matchesMonthOptions(
    options: FastEditOption[],
    labels: readonly string[],
) {
    if (options.length !== labels.length) return false
    for (let index = 0; index < labels.length; index++) {
        if (
            index in options !== index in labels ||
            options[index]?.label !== labels[index]
        )
            return false
    }
    return true
}

export default function useCalendarHeaderLogic({
    currentDate,
    onViewDateChange,
    customDesign = defaultCalendarDesign,
    messages: providedMessages,
}: CalendarHeaderInternalProps): CalendarHeaderLogicResult {
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const messages = providedMessages ?? resolveCalendarMessages()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const [cachedMonthOptions, setMonthOptions] = useState(() =>
        getMonthOptions(messages.months),
    )
    let monthOptions = cachedMonthOptions
    if (!matchesMonthOptions(cachedMonthOptions, messages.months)) {
        monthOptions = getMonthOptions(messages.months)
        setMonthOptions(monthOptions)
    }
    const yearOptions = useMemo(
        () => getYearOptions(currentYear),
        [currentYear],
    )

    function handleMonthChange(value: string) {
        onViewDateChange(createCalendarDate(currentYear, Number(value), 1))
    }

    function handleYearChange(value: string) {
        onViewDateChange(createCalendarDate(Number(value), currentMonth, 1))
    }

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
