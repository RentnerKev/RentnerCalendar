import type { ReactNode } from 'react'
import type {
    CalendarLocale,
    CalendarMessages,
} from '../../../lib/Calendar/Types/Messages.types.ts'
import type {
    CalendarAppearance,
    CalendarCustomDesign,
} from './Calendar.types.ts'

export interface CalendarProviderProps extends CalendarAppearance {
    children: ReactNode
    locale?: CalendarLocale
    /** Caps the calendar dialog width in CSS pixels when positive. */
    popoverMaxWidth?: number
    messages?: Partial<CalendarMessages>
    customDesign?: CalendarCustomDesign
}

export type CalendarDefaults = Omit<CalendarProviderProps, 'children'>

export interface CalendarProviderLogicResult {
    state: { value: CalendarDefaults }
}
