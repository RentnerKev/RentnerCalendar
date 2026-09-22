import type { KeyboardEvent } from 'react'

function getTargetIndex(
    key: string,
    currentIndex: number,
    columnCount: number,
    itemCount: number,
) {
    switch (key) {
        case 'ArrowLeft':
            return currentIndex - 1
        case 'ArrowRight':
            return currentIndex + 1
        case 'ArrowUp':
            return currentIndex - columnCount
        case 'ArrowDown':
            return currentIndex + columnCount
        case 'Home':
            return currentIndex - (currentIndex % columnCount)
        case 'End':
            return Math.min(
                itemCount - 1,
                currentIndex + columnCount - 1 - (currentIndex % columnCount),
            )
        default:
            return null
    }
}

export default function useCalendarGridNavigation(columnCount: number) {
    function handleDayKeyDown(
        event: KeyboardEvent<HTMLButtonElement>,
        currentIndex: number,
    ) {
        const grid = event.currentTarget.closest('[data-calendar-grid]')
        const dayButtons = grid
            ? Array.from(
                  grid.querySelectorAll<HTMLButtonElement>(
                      '[data-calendar-day]',
                  ),
              )
            : []
        const targetIndex = getTargetIndex(
            event.key,
            currentIndex,
            columnCount,
            dayButtons.length,
        )

        if (targetIndex === null) {
            return
        }

        event.preventDefault()

        const direction =
            event.key === 'Home'
                ? 1
                : event.key === 'End'
                  ? -1
                  : targetIndex < currentIndex
                    ? -1
                    : 1
        let nextIndex = targetIndex

        while (nextIndex >= 0 && nextIndex < dayButtons.length) {
            const target = dayButtons[nextIndex]

            if (!target.disabled) {
                target.focus()
                return
            }

            nextIndex += direction
        }
    }

    return {
        handler: { handleDayKeyDown },
    }
}
