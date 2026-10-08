import {
    CalendarContext,
    useCalendarProviderLogic,
} from '../Hooks/useCalendarDefaults.ts'
import type { CalendarProviderProps } from '../Types/CalendarProvider.types.ts'
export type {
    CalendarProviderProps,
    CalendarDefaults,
} from '../Types/CalendarProvider.types.ts'
export { useCalendarDefaults } from '../Hooks/useCalendarDefaults.ts'

export function CalendarProvider(props: CalendarProviderProps) {
    const { state } = useCalendarProviderLogic(props)
    return (
        <CalendarContext.Provider value={state.value}>
            {props.children}
        </CalendarContext.Provider>
    )
}
