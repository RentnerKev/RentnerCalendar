import type { CalendarCustomDesign } from './Calendar.types.ts'
export type CalendarTimeInputLogicResult = {
    state: {
        cd: Required<CalendarCustomDesign>
        messages: import('../../../lib/Calendar/Types/Messages.types.ts').CalendarMessages
        rangeValue: null[] | import('./Calendar.types.ts').CalendarRange
        singleDate: Date | null
        enableRange: boolean | undefined
        minTime: string | undefined
        maxTime: string | undefined
        disabled: boolean
        readOnly: boolean
    }
    handler: {
        handleUpdate: (index: 0 | 1, newDate: Date) => void
    }
}
