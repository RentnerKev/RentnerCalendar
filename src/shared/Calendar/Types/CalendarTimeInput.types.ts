import type {
    CalendarAppearance,
    CalendarDateInput,
    CalendarCustomDesign,
} from './Calendar.types.ts'

export interface SingleTimeInputProps extends CalendarAppearance {
    date: Date | null
    label?: string
    onChangeDate: (date: Date) => void
    cd: Required<CalendarCustomDesign>
    minDateTime?: CalendarDateInput
    maxDateTime?: CalendarDateInput
    minTime?: string
    maxTime?: string
    disabled?: boolean
    readOnly?: boolean
}
