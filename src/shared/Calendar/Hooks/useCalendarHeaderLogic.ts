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
    return Array.from({ length: 101 }, (_, index) => {
        const year = startYear + index
        return {
            value: year.toString(),
            label: year.toString(),
        }
    })
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
    const monthOptions: FastEditOption[] = messages.months.map(
        (label, month) => ({
            value: month.toString(),
            label,
        }),
    )
    const yearOptions = getYearOptions(currentYear)

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
