import { createContext, useContext, useMemo } from 'react'
import type {
    CalendarDefaults,
    CalendarProviderProps,
    CalendarProviderLogicResult,
} from '../Types/CalendarProvider.types.js'

export const CalendarContext = createContext<CalendarDefaults>({})

export function useCalendarDefaults(): CalendarDefaults {
    return useContext(CalendarContext)
}

export function useCalendarProviderLogic({
    locale,
    messages,
    customDesign,
}: CalendarProviderProps): CalendarProviderLogicResult {
    const parent = useCalendarDefaults()
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
    return { state: { value } }
}
