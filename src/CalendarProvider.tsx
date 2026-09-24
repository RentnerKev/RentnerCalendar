import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { CalendarLocale, CalendarMessages } from './messages.js'
import type { CalendarCustomDesign } from './types.js'

export interface CalendarProviderProps {
    children: ReactNode
    locale?: CalendarLocale
    messages?: Partial<CalendarMessages>
    customDesign?: CalendarCustomDesign
}

export type CalendarDefaults = Omit<CalendarProviderProps, 'children'>

const CalendarContext = createContext<CalendarDefaults>({})

export function CalendarProvider({
    children,
    locale,
    messages,
    customDesign,
}: CalendarProviderProps) {
    const parent = useContext(CalendarContext)
    const value = useMemo<CalendarDefaults>(
        () => ({
            locale: locale ?? parent.locale,
            messages: {
                ...parent.messages,
                ...messages,
                holidayNames: {
                    ...parent.messages?.holidayNames,
                    ...messages?.holidayNames,
                },
            },
            customDesign: { ...parent.customDesign, ...customDesign },
        }),
        [parent, locale, messages, customDesign],
    )

    return (
        <CalendarContext.Provider value={value}>
            {children}
        </CalendarContext.Provider>
    )
}

export function useCalendarDefaults(): CalendarDefaults {
    return useContext(CalendarContext)
}
