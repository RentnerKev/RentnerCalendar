import type { KeyboardEvent } from 'react'

export type SingleTimeInputLogicResult = {
    state: {
        timeStr: string
        cursorPos: number | null
    }
    handler: {
        handleKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void
        handleFocus: () => void
        handleBlur: () => void
    }
    setter: {
        setCursorPos: import('react').Dispatch<
            import('react').SetStateAction<number | null>
        >
    }
    refs: {
        containerRef: import('react').RefObject<HTMLDivElement | null>
    }
}
