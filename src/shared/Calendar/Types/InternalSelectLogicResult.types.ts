import type {
    CSSProperties,
    InvalidEvent,
    KeyboardEvent,
    ChangeEvent,
    PointerEvent,
} from 'react'

export type InternalSelectLogicResult = {
    state: {
        defaultPortalContainer: HTMLElement | null
        popupStyle: CSSProperties
        listboxId: string
        triggerId: string
        messages: import('../../../lib/Calendar/Types/Messages.types.ts').CalendarMessages
        isInteractionDisabled: boolean
        open: boolean
        searchValue: string
        selectedValues: string[]
        error: string | null
        hasError: boolean
        hasLeftIcon: boolean
        filteredOptions: import('./InternalSelect.types.ts').Option[]
        selectedOptions: import('./InternalSelect.types.ts').Option[]
    }
    handler: {
        handleTriggerClick: () => void
        handleTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
        handleNativeContentKeyDown: (
            event: KeyboardEvent<HTMLDivElement>,
        ) => void
        handleNativeOptionKeyDown: (
            event: KeyboardEvent<HTMLDivElement>,
        ) => void
        handleValueChange: (nextValue: string) => void
        handleInvalid: (event: InvalidEvent<HTMLInputElement>) => void
        handleSearchChange: (event: ChangeEvent<HTMLInputElement>) => void
        handleSearchPointerDownCapture: (
            event: PointerEvent<HTMLInputElement>,
        ) => void
    }
    refs: {
        triggerRef: import('react').RefObject<HTMLButtonElement | null>
        contentRef: import('react').RefObject<HTMLDivElement | null>
        searchInputRef: import('react').RefObject<HTMLInputElement | null>
        validationInputRef: import('react').RefObject<HTMLInputElement | null>
    }
}
