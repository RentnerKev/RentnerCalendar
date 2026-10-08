import type { CalendarGridProps } from './Calendar.types.ts'
export interface CalendarGridInternalProps extends CalendarGridProps {
    currentDate: Date
    onViewDateChange: (date: Date) => void
    monthHeadingId: string
    keyboardHelpId: string
}
