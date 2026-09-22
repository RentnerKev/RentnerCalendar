import { useCallback, useState } from 'react'
import type { RefObject } from 'react'

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

export default function useCalendarPosition(
    triggerRef: RefObject<HTMLElement | null>,
) {
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
        const documentHeight = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight,
        )
        const spaceBelow = window.innerHeight - rect.bottom
        const spaceAbove = rect.top
        const estimatedCalendarHeight = 450
        const dropdownPosition: CalendarPosition['dropdownPosition'] =
            spaceBelow < estimatedCalendarHeight && spaceAbove > spaceBelow
                ? 'top'
                : 'bottom'

        setPosition({
            dropdownPosition,
            coords: {
                left: rect.left + window.scrollX,
                top: rect.bottom + window.scrollY + 8,
                bottom: documentHeight - (rect.top + window.scrollY) + 8,
                width: rect.width,
                maxHeight:
                    dropdownPosition === 'bottom'
                        ? Math.max(spaceBelow - 16, 250)
                        : Math.max(spaceAbove - 16, 250),
            },
        })
    }, [triggerRef])

    return {
        handler: { updatePosition },
        state: position,
    }
}
