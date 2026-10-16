import { createContext, useContext, useMemo } from 'react'
import type {
    CalendarDefaults,
    CalendarProviderProps,
    CalendarProviderLogicResult,
} from '../Types/CalendarProvider.types.ts'

export const CalendarContext = createContext<CalendarDefaults>({})

export function useCalendarDefaults(): CalendarDefaults {
    return useContext(CalendarContext)
}

export function useCalendarProviderLogic({
    controlSize,
    classNames,
    portalContainer,
    portalClassName,
    portalZIndex,
    locale,
    messages,
    customDesign,
}: CalendarProviderProps): CalendarProviderLogicResult {
    const parent = useCalendarDefaults()
    const value = useMemo<CalendarDefaults>(
        () => ({
            controlSize: controlSize ?? parent.controlSize,
            classNames: { ...parent.classNames, ...classNames },
            portalContainer:
                portalContainer === undefined
                    ? parent.portalContainer
                    : portalContainer,
            portalClassName: portalClassName ?? parent.portalClassName,
            portalZIndex: portalZIndex ?? parent.portalZIndex,
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
        [
            parent,
            locale,
            messages,
            customDesign,
            controlSize,
            classNames,
            portalContainer,
            portalClassName,
            portalZIndex,
        ],
    )
    return { state: { value } }
}
