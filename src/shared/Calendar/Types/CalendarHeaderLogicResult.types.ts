import type { CalendarCustomDesign } from './Calendar.types.ts'
export type CalendarHeaderLogicResult = {
    state: {
        cd: Required<CalendarCustomDesign>
        messages: import('../../../lib/Calendar/Types/Messages.types.ts').CalendarMessages
        currentMonth: number
        currentYear: number
        monthOptions: FastEditOption[]
        yearOptions: FastEditOption[]
    }
    handler: {
        handleMonthChange: (value: string) => void
        handleYearChange: (value: string) => void
    }
}
import type { FastEditOption } from './CalendarHeader.types.ts'
