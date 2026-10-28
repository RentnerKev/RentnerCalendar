import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import type {
    InternalSelectOverlayOptions,
    InternalSelectOverlayResult,
} from '../Types/InternalSelectOverlay.types.ts'

const useBrowserLayoutEffect =
    typeof window === 'undefined' ? useEffect : useLayoutEffect
const activeOverlays = new WeakMap<Document, () => void>()

export function useInternalSelectOverlay({
    open,
    triggerId,
    portalContainer,
    searchInputRef,
    onOpenChange,
    onSelect,
    onSearch,
}: InternalSelectOverlayOptions): InternalSelectOverlayResult {
    const triggerRef = useRef<HTMLButtonElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const callbacks = useRef({ onOpenChange, onSelect, onSearch })
    const [popupStyle, setPopupStyle] = useState<CSSProperties>({
        position: 'fixed',
        visibility: 'hidden',
    })
    useBrowserLayoutEffect(() => {
        callbacks.current = { onOpenChange, onSelect, onSearch }
    })
    const [defaultPortalContainer, setDefaultPortalContainer] =
        useState<HTMLElement | null>(null)
    useBrowserLayoutEffect(() => {
        setDefaultPortalContainer(
            triggerRef.current?.ownerDocument.body ?? null,
        )
    }, [])

    function close(restoreFocus = false) {
        callbacks.current.onOpenChange(false)
        if (restoreFocus) triggerRef.current?.focus({ preventScroll: true })
    }
    function handleTriggerClick() {
        callbacks.current.onOpenChange(!open)
    }
    function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault()
            callbacks.current.onOpenChange(true)
        }
    }
    function focusOption(direction: number | 'first' | 'last') {
        const nodes = [
            ...(contentRef.current?.querySelectorAll<HTMLElement>(
                '[role="option"]',
            ) ?? []),
        ]
        const current = nodes.findIndex((node) => node.matches(':focus'))
        const index =
            direction === 'first'
                ? 0
                : direction === 'last'
                  ? nodes.length - 1
                  : current < 0
                    ? direction > 0
                        ? 0
                        : nodes.length - 1
                    : Math.max(
                          0,
                          Math.min(nodes.length - 1, current + direction),
                      )
        nodes[index]?.focus({ preventScroll: true })
        nodes[index]?.scrollIntoView({ block: 'nearest' })
    }
    function handleContentKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.nativeEvent.isComposing) return
        if (event.key === 'Enter' && event.target === searchInputRef.current) {
            event.preventDefault()
            const first =
                contentRef.current?.querySelector<HTMLElement>(
                    '[role="option"]',
                )
            if (first?.dataset.value !== undefined)
                callbacks.current.onSelect(first.dataset.value)
            return
        }
        if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            close(true)
        } else if (
            [
                'ArrowDown',
                'ArrowUp',
                'Home',
                'End',
                'PageDown',
                'PageUp',
            ].includes(event.key) &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
        ) {
            if (
                event.target === searchInputRef.current &&
                ['Home', 'End'].includes(event.key)
            )
                return
            event.preventDefault()
            event.stopPropagation()
            focusOption(
                event.key === 'Home'
                    ? 'first'
                    : event.key === 'End'
                      ? 'last'
                      : event.key === 'ArrowDown'
                        ? 1
                        : event.key === 'ArrowUp'
                          ? -1
                          : event.key === 'PageDown'
                            ? 10
                            : -10,
            )
        } else if (
            event.target !== searchInputRef.current &&
            event.key.length === 1 &&
            event.key !== ' ' &&
            !event.altKey &&
            !event.ctrlKey &&
            !event.metaKey
        ) {
            event.preventDefault()
            event.stopPropagation()
            callbacks.current.onSearch((current) => current + event.key)
            searchInputRef.current?.focus()
        }
    }
    function handleOptionKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.nativeEvent.isComposing) return
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            event.stopPropagation()
            const value = event.currentTarget.dataset.value
            if (value !== undefined) callbacks.current.onSelect(value)
        }
    }

    useBrowserLayoutEffect(() => {
        if (!open) return
        const trigger = triggerRef.current
        const content = contentRef.current
        if (!trigger || !content) return
        const ownerDocument = trigger.ownerDocument
        const view = ownerDocument.defaultView
        if (!view) return
        const dismiss = () => callbacks.current.onOpenChange(false)
        const previousDismiss = activeOverlays.get(ownerDocument)
        activeOverlays.set(ownerDocument, dismiss)
        previousDismiss?.()
        // Native top-layer positioning retains the configured portal ancestry
        // without clipping or transformed fixed-position containing blocks.
        content.showPopover?.()
        let moveObserver: IntersectionObserver | undefined
        let observedAnchor:
            | Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>
            | undefined
        function updatePosition() {
            const rect = trigger!.getBoundingClientRect()
            const viewport = view!.visualViewport
            const viewportLeft = viewport?.offsetLeft ?? 0
            const viewportTop = viewport?.offsetTop ?? 0
            const viewportWidth = viewport?.width ?? view!.innerWidth
            const viewportHeight = viewport?.height ?? view!.innerHeight
            const gutter = 8
            const width = Math.min(
                Math.max(180, rect.width),
                Math.max(0, viewportWidth - gutter * 2),
            )
            const below = Math.max(
                0,
                viewportTop + viewportHeight - rect.bottom - gutter - 4,
            )
            const above = Math.max(0, rect.top - viewportTop - gutter - 4)
            const height = Math.min(320, Math.max(below, above))
            const top =
                below >= Math.min(320, content!.scrollHeight) || below >= above
                    ? rect.bottom + 4
                    : Math.max(
                          viewportTop + gutter,
                          rect.top -
                              Math.min(content!.scrollHeight, height) -
                              4,
                      )
            const next: CSSProperties = {
                position: 'fixed',
                margin: 0,
                inset: 'auto',
                top,
                left: Math.max(
                    viewportLeft + gutter,
                    Math.min(
                        rect.left,
                        viewportLeft + viewportWidth - width - gutter,
                    ),
                ),
                width,
                maxHeight: height,
                visibility: 'visible',
            }
            setPopupStyle((previous) =>
                Object.keys(next).every(
                    (key) =>
                        previous[key as keyof CSSProperties] ===
                        next[key as keyof CSSProperties],
                )
                    ? previous
                    : next,
            )
            if (
                view!.IntersectionObserver &&
                (!observedAnchor ||
                    observedAnchor.left !== rect.left ||
                    observedAnchor.top !== rect.top ||
                    observedAnchor.width !== rect.width ||
                    observedAnchor.height !== rect.height)
            ) {
                moveObserver?.disconnect()
                observedAnchor = rect
                if (rect.width > 0 && rect.height > 0) {
                    const root = ownerDocument.documentElement
                    moveObserver = new view!.IntersectionObserver(
                        (entries) => {
                            if (entries[0]?.intersectionRatio !== 1)
                                schedulePosition()
                        },
                        {
                            rootMargin: [
                                -Math.floor(rect.top),
                                -Math.floor(root.clientWidth - rect.right),
                                -Math.floor(root.clientHeight - rect.bottom),
                                -Math.floor(rect.left),
                            ]
                                .map((margin) => `${margin}px`)
                                .join(' '),
                            threshold: 1,
                        },
                    )
                    moveObserver.observe(trigger!)
                }
            }
        }
        updatePosition()
        let frame: number | undefined
        function schedulePosition(event?: Event) {
            if (event?.composedPath().includes(content!)) return
            if (frame === undefined)
                frame = view!.requestAnimationFrame(() => {
                    frame = undefined
                    updatePosition()
                })
        }
        function handleOutsidePointer(event: globalThis.PointerEvent) {
            const path = event.composedPath()
            if (!path.includes(trigger!) && !path.includes(content!))
                callbacks.current.onOpenChange(false)
        }
        function handleEscape(event: globalThis.KeyboardEvent) {
            if (
                event.key !== 'Escape' ||
                event.defaultPrevented ||
                event.isComposing
            )
                return
            // The calendar tab loop can focus a sibling while this popup is
            // open. Dismiss the topmost select before its parent calendar.
            event.preventDefault()
            event.stopPropagation()
            close(true)
        }
        const observer = new view.ResizeObserver(() => schedulePosition())
        observer.observe(trigger)
        observer.observe(content)
        view.addEventListener('resize', schedulePosition)
        view.visualViewport?.addEventListener('resize', schedulePosition)
        view.visualViewport?.addEventListener('scroll', schedulePosition)
        ownerDocument.addEventListener('scroll', schedulePosition, true)
        ownerDocument.addEventListener(
            'pointerdown',
            handleOutsidePointer,
            true,
        )
        ownerDocument.addEventListener('keydown', handleEscape, true)
        return () => {
            if (activeOverlays.get(ownerDocument) === dismiss)
                activeOverlays.delete(ownerDocument)
            observer.disconnect()
            moveObserver?.disconnect()
            view.removeEventListener('resize', schedulePosition)
            view.visualViewport?.removeEventListener('resize', schedulePosition)
            view.visualViewport?.removeEventListener('scroll', schedulePosition)
            ownerDocument.removeEventListener('scroll', schedulePosition, true)
            ownerDocument.removeEventListener(
                'pointerdown',
                handleOutsidePointer,
                true,
            )
            ownerDocument.removeEventListener('keydown', handleEscape, true)
            if (frame !== undefined) view.cancelAnimationFrame(frame)
            if (content.isConnected && content.matches(':popover-open'))
                content.hidePopover?.()
        }
    }, [open, searchInputRef, triggerId, portalContainer])
    useBrowserLayoutEffect(() => {
        if (open && popupStyle.visibility === 'visible') {
            searchInputRef.current?.focus({ preventScroll: true })
        }
    }, [open, popupStyle.visibility, searchInputRef, portalContainer])
    return {
        state: { popupStyle, defaultPortalContainer },
        refs: { triggerRef, contentRef },
        handler: {
            handleTriggerClick,
            handleTriggerKeyDown,
            handleContentKeyDown,
            handleOptionKeyDown,
        },
    }
}
