import type { KeyboardEvent, RefObject } from 'react'

export interface CalendarGridNavigationOptions {
    columnCount: number
    weekStartsOn: number
    currentDate: Date
    initialFocusDate?: Date
    minDate?: Date
    maxDate?: Date
    availabilityKey: string
    isDateSelectable?: (date: Date) => boolean
    onViewDateChange: (date: Date) => void
}

export interface CalendarGridNavigationResult {
    state: { activeDateKey: string }
    handler: {
        handleDayFocus: (date: Date) => void
        handleDayKeyDown: (
            event: KeyboardEvent<HTMLButtonElement>,
            date: Date,
        ) => void
    }
    refs: { gridRef: RefObject<HTMLDivElement | null> }
}
