import type { ChangeEvent, ClipboardEvent, KeyboardEvent, MouseEvent } from 'react'

export type SingleTimeInputLogicResult = {
    state: {
        timeStr: string
        cursorPos: number | null
    }
    handler: {
        handleKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
        handleFocus: () => void
        handleBlur: () => void
        handleClick: (event: MouseEvent<HTMLInputElement>) => void
        handleChange: (event: ChangeEvent<HTMLInputElement>) => void
        handlePaste: (event: ClipboardEvent<HTMLInputElement>) => void
    }
    refs: {
        inputRef: import('react').RefObject<HTMLInputElement | null>
    }
}
