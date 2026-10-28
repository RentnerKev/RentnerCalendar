import type { CSSProperties, KeyboardEvent, RefObject } from 'react'

export interface InternalSelectOverlayOptions {
    open: boolean
    triggerId: string
    portalContainer?: Element | DocumentFragment | null
    searchInputRef: RefObject<HTMLInputElement | null>
    onOpenChange: (open: boolean) => void
    onSelect: (value: string) => void
    onSearch: (update: (current: string) => string) => void
}

export interface InternalSelectOverlayResult {
    state: {
        popupStyle: CSSProperties
        defaultPortalContainer: HTMLElement | null
    }
    refs: {
        triggerRef: RefObject<HTMLButtonElement | null>
        contentRef: RefObject<HTMLDivElement | null>
    }
    handler: {
        handleTriggerClick: () => void
        handleTriggerKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void
        handleContentKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
        handleOptionKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
    }
}
