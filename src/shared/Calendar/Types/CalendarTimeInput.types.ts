import type { CalendarCustomDesign } from './Calendar.types.js'

export interface SingleTimeInputProps {
    date: Date | null
    label?: string
    onChangeDate: (date: Date) => void
    cd: Required<CalendarCustomDesign>
    minTime?: string
    maxTime?: string
    disabled?: boolean
    readOnly?: boolean
}

export interface CalendarTimeDigitProps {
    char: string
    isActive: boolean
    onClick: () => void
    cd: Required<CalendarCustomDesign>
    disabled?: boolean
    readOnly?: boolean
}
