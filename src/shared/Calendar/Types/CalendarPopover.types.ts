import type { CSSProperties, RefObject } from 'react'
import type {
    CalendarMessages,
    CalendarLocale,
} from '../../../lib/Calendar/messages.js'
import type { CalendarCustomDesign, CalendarValue } from './Calendar.types.js'
export interface CalendarPopoverProps {
    backdrop: boolean
    onClose: () => void
    dialogId: string
    popoverRef: RefObject<HTMLDivElement | null>
    className: string
    style: CSSProperties
    labelledBy?: string
    describedBy?: string
    dialogLabel: string
    switchMode: boolean
    isRangeMode: boolean
    onRangeModeChange: (isRange: boolean) => void
    disabled: boolean
    readOnly: boolean
    messages: CalendarMessages
    currentDate: Date
    onPrevMonth: () => void
    onNextMonth: () => void
    onViewDateChange: (date: Date) => void
    fastEdit: boolean
    customDesign: CalendarCustomDesign
    getDaysInMonth: () => { date: Date; isCurrentMonth: boolean }[]
    selectedDate?: CalendarValue
    onSelectDate: (date: Date) => void
    minDate?: Date
    maxDate?: Date
    weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7
    visibleDays: number
    showHolidays: boolean
    locale: CalendarLocale
    enableTime: boolean
    onTimeChange: (value: CalendarValue) => void
    minTime?: string
    maxTime?: string
    button: boolean
    onApply: () => void
}
