import type {
    CalendarPosition,
    CalendarPositionOptions,
    CalendarPositionResult,
} from '../Types/CalendarPosition.types.ts'
import { useCallback, useState } from 'react'
import type { RefObject } from 'react'
import { fixedCalendarOrigin } from '../../../lib/Calendar/CalendarGeometry.ts'

export default function useCalendarPosition(
    triggerRef: RefObject<HTMLElement | null>,
    popoverRef: RefObject<HTMLElement | null>,
    { minWidth = 340, matchTriggerWidth = false }: CalendarPositionOptions = {},
): CalendarPositionResult {
    const [position, setPosition] = useState<CalendarPosition>({
        dropdownPosition: 'bottom',
        coords: { top: 0, bottom: 0, left: 0, width: 0, maxHeight: 0 },
    })

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current

        if (!trigger) {
            return
        }

        const view = trigger.ownerDocument.defaultView
        if (!view) return
        const rect = trigger.getBoundingClientRect()
        const viewport = view.visualViewport
        const viewportLeft = viewport?.offsetLeft ?? 0
        const viewportTop = viewport?.offsetTop ?? 0
        const viewportWidth = viewport?.width ?? view.innerWidth
        const viewportHeight = viewport?.height ?? view.innerHeight
        const origin = popoverRef.current
            ? fixedCalendarOrigin(popoverRef.current)
            : { x: 0, y: 0, scaleX: 1, scaleY: 1, height: view.innerHeight }
        const viewportGutter = Math.min(8, viewportHeight / 2)
        const anchorGap = 8
        const horizontalGutter = Math.min(16, viewportWidth / 2)
        const availableWidth = Math.max(
            0,
            viewportWidth - horizontalGutter * 2,
        )
        const preferredWidth = matchTriggerWidth
            ? Math.max(minWidth, rect.width)
            : minWidth
        const width = Math.min(preferredWidth, availableWidth)
        const maxLeft = Math.max(
            viewportLeft + horizontalGutter,
            viewportLeft + viewportWidth - width - horizontalGutter,
        )
        const preferredLeft = view.getComputedStyle(trigger).direction === 'rtl'
            ? rect.right - width
            : rect.left
        const left = Math.min(Math.max(preferredLeft, viewportLeft + horizontalGutter), maxLeft)
        const maxAnchorY = Math.max(
            viewportTop + viewportGutter,
            viewportTop + viewportHeight - viewportGutter,
        )
        const clampAnchorY = (value: number) =>
            Math.min(Math.max(value, viewportTop + viewportGutter), maxAnchorY)
        const anchorTop = clampAnchorY(rect.top)
        const anchorBottom = clampAnchorY(rect.bottom)
        const spaceBelow = Math.max(
            0,
            viewportTop + viewportHeight - anchorBottom - anchorGap - viewportGutter,
        )
        const spaceAbove = Math.max(0, anchorTop - viewportTop - anchorGap - viewportGutter)
        const estimatedCalendarHeight = 450
        const dropdownPosition: CalendarPosition['dropdownPosition'] =
            spaceBelow < estimatedCalendarHeight && spaceAbove > spaceBelow
                ? 'top'
                : 'bottom'

        const nextPosition: CalendarPosition = {
            dropdownPosition,
            coords: {
                left: (left - origin.x) / origin.scaleX,
                top: (anchorBottom + anchorGap - origin.y) / origin.scaleY,
                bottom: origin.height - (anchorTop - anchorGap - origin.y) / origin.scaleY,
                width: width / origin.scaleX,
                maxHeight:
                    (dropdownPosition === 'bottom' ? spaceBelow : spaceAbove) / origin.scaleY,
            },
        }
        setPosition((previous) =>
            previous.dropdownPosition === nextPosition.dropdownPosition &&
            Object.keys(nextPosition.coords).every(
                (key) =>
                    previous.coords[key as keyof CalendarPosition['coords']] ===
                    nextPosition.coords[
                        key as keyof CalendarPosition['coords']
                    ],
            )
                ? previous
                : nextPosition,
        )
    }, [triggerRef, popoverRef, minWidth, matchTriggerWidth])

    return {
        handler: { updatePosition },
        state: position,
    }
}
