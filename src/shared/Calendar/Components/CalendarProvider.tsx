import {
    CalendarContext,
    useCalendarProviderLogic,
} from '../Hooks/useCalendarDefaults.js'
import type { CalendarProviderProps } from '../Types/CalendarProvider.types.js'
export type {
    CalendarProviderProps,
    CalendarDefaults,
} from '../Types/CalendarProvider.types.js'
export { useCalendarDefaults } from '../Hooks/useCalendarDefaults.js'

export function CalendarProvider(props: CalendarProviderProps) {
    const { state } = useCalendarProviderLogic(props)
    return (
        <CalendarContext.Provider value={state.value}>
            {props.children}
        </CalendarContext.Provider>
    )
}
