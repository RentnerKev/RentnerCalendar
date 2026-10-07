import type {
    InvalidEvent,
    FocusEvent,
    KeyboardEvent,
    ChangeEvent,
    PointerEvent,
} from 'react'

export type InternalSelectLogicResult = {
    state: {
        triggerId: string
        messages: import('../../../lib/Calendar/messages.js').CalendarMessages
        isInteractionDisabled: boolean
        open: boolean
        searchValue: string
        selectedValues: string[]
        error: string | null
        hasError: boolean
        hasLeftIcon: boolean
        filteredOptions: import('./InternalSelect.types.js').Option[]
        selectedOptions: import('./InternalSelect.types.js').Option[]
    }
    handler: {
        handleValueChange: (nextValue: string) => void
        handleInvalid: (event: InvalidEvent<HTMLInputElement>) => void
        handleOpenChange: (nextOpen: boolean) => void
        handleContentFocusCapture: (event: FocusEvent<HTMLDivElement>) => void
        handleContentKeyDownCapture: (
            event: KeyboardEvent<HTMLDivElement>,
        ) => void
        handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void
        handleSearchPointerDownCapture: (
            event: PointerEvent<HTMLInputElement>,
        ) => void
        handleSearchKeyDownCapture: (
            event: KeyboardEvent<HTMLInputElement>,
        ) => void
        handleSearchKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
        handleOptionPointerDown: () => void
        handleOptionKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
    }
    refs: {
        searchInputRef: import('react').RefObject<HTMLInputElement | null>
        validationInputRef: import('react').RefObject<HTMLInputElement | null>
    }
}
