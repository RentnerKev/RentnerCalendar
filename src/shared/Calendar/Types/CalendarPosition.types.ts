export interface CalendarPosition {
    dropdownPosition: 'bottom' | 'top'
    coords: {
        top: number
        bottom: number
        left: number
        width: number
        maxHeight: number
    }
}

export interface CalendarPositionOptions {
    minWidth?: number
    maxWidth?: number
    matchTriggerWidth?: boolean
}

export interface CalendarPositionResult {
    state: CalendarPosition
    handler: { updatePosition: () => void }
}
