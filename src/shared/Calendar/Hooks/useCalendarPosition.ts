import type {
    CalendarPosition,
    CalendarPositionOptions,
    CalendarPositionResult,
} from '../Types/CalendarPosition.types.ts'
import { useCallback, useState } from 'react'
import type { RefObject } from 'react'

export default function useCalendarPosition(
    triggerRef: RefObject<HTMLElement | null>,
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

        const rect = trigger.getBoundingClientRect()
        const viewportGutter = Math.min(8, window.innerHeight / 2)
        const anchorGap = 8
        const horizontalGutter = Math.min(16, window.innerWidth / 2)
        const availableWidth = Math.max(
            0,
            window.innerWidth - horizontalGutter * 2,
        )
        const preferredWidth = matchTriggerWidth
            ? Math.max(minWidth, rect.width)
            : minWidth
        const width = Math.min(preferredWidth, availableWidth)
        const maxLeft = Math.max(
            horizontalGutter,
            window.innerWidth - width - horizontalGutter,
        )
        const left = Math.min(Math.max(rect.left, horizontalGutter), maxLeft)
        const maxAnchorY = Math.max(
            viewportGutter,
            window.innerHeight - viewportGutter,
        )
        const clampAnchorY = (value: number) =>
            Math.min(Math.max(value, viewportGutter), maxAnchorY)
        const anchorTop = clampAnchorY(rect.top)
        const anchorBottom = clampAnchorY(rect.bottom)
        const spaceBelow = Math.max(
            0,
            window.innerHeight - anchorBottom - anchorGap - viewportGutter,
        )
        const spaceAbove = Math.max(0, anchorTop - anchorGap - viewportGutter)
        const estimatedCalendarHeight = 450
        const dropdownPosition: CalendarPosition['dropdownPosition'] =
            spaceBelow < estimatedCalendarHeight && spaceAbove > spaceBelow
                ? 'top'
                : 'bottom'

        const nextPosition: CalendarPosition = {
            dropdownPosition,
            coords: {
                left,
                top: anchorBottom + anchorGap,
                bottom: window.innerHeight - anchorTop + anchorGap,
                width,
                maxHeight:
                    dropdownPosition === 'bottom' ? spaceBelow : spaceAbove,
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
    }, [triggerRef, minWidth, matchTriggerWidth])

    return {
        handler: { updatePosition },
        state: position,
    }
}
