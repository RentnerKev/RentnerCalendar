import type { KeyboardEvent, MouseEvent } from 'react'

export type CalendarPopoverLogicResult = {
    state: {
        monthHeadingId: string
        keyboardHelpId: string
        applyDisabled: boolean
    }
    handler: {
        handleDialogKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
        handleBackdropClick: (event: MouseEvent<HTMLDivElement>) => void
    }
}
