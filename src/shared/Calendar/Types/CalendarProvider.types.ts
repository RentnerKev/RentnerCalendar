import type { ReactNode } from 'react'
import type {
    CalendarLocale,
    CalendarMessages,
} from '../../../lib/Calendar/Types/Messages.types.ts'
import type { CalendarCustomDesign } from './Calendar.types.ts'

export interface CalendarProviderProps {
    children: ReactNode
    locale?: CalendarLocale
    messages?: Partial<CalendarMessages>
    customDesign?: CalendarCustomDesign
}

export type CalendarDefaults = Omit<CalendarProviderProps, 'children'>

export interface CalendarProviderLogicResult {
    state: { value: CalendarDefaults }
}
