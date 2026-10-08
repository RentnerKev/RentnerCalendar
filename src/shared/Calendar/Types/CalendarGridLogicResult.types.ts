import type { CalendarCustomDesign } from './Calendar.types.ts'
export type CalendarGridLogicResult = {
    state: {
        cd: Required<CalendarCustomDesign>
        messages: import('../../../lib/Calendar/Types/Messages.types.ts').CalendarMessages
        rows: {
            date: Date
            dateKey: string
            isSelected: boolean
            isInRange: boolean
            holidayName: string | null
            dayDisabled: boolean | undefined
            isCurrentDay: boolean
            buttonClass: string
            dateLabel: string
            rangeMembership: string | undefined
        }[][]
        weekDays: {
            shortName: string
            fullName: string
        }[]
        activeDateKey: string
    }
    handler: {
        handleDayFocus: (date: Date) => void
        handleDayKeyDown: (
            event: import('react').KeyboardEvent<HTMLButtonElement>,
            date: Date,
        ) => void
        handleSelectDate: (date: Date) => void
    }
    refs: {
        gridRef: import('react').RefObject<HTMLDivElement | null>
    }
}
