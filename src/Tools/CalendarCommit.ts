import type { CalendarValue } from '../types.js'

interface CalendarCommitOptions {
    backdrop: boolean
    button: boolean
    closeOnSelect: boolean
}

interface CalendarCloseOptions {
    button: boolean
    closeOnSelect: boolean
    isRangeMode: boolean
    source?: 'date' | 'time'
}

export function commitCalendarSelection(
    value: CalendarValue,
    onChange: ((nextValue: CalendarValue) => void) | undefined,
    { button }: CalendarCommitOptions,
) {
    if (!button) {
        onChange?.(value)
    }
}

export function shouldCloseCalendarAfterSelection(
    value: CalendarValue,
    { button, closeOnSelect, isRangeMode, source }: CalendarCloseOptions,
) {
    if (button || !closeOnSelect || source !== 'date') {
        return false
    }

    if (isRangeMode) {
        return Boolean(Array.isArray(value) && value[0] && value[1])
    }

    return Boolean(value && !Array.isArray(value))
}
