import type { CalendarPopoverLogicResult } from '../Types/CalendarPopoverLogicResult.types.ts'
import type { KeyboardEvent, MouseEvent } from 'react'
import type { CalendarPopoverProps } from '../Types/CalendarPopover.types.ts'
import { calendarValueHasTimeWithinBounds } from '../../../lib/Calendar/CalendarTime.ts'
import { calendarValueWithinDateBounds } from '../../../lib/Calendar/CalendarDay.ts'
const focusableSelector =
    'a[href], area[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex], [contenteditable="true"]'

function getFocusableElements(root: HTMLElement) {
    return Array.from(
        root.querySelectorAll<HTMLElement>(focusableSelector),
    ).filter(
        (element) =>
            element.tabIndex >= 0 &&
            !element.matches(':disabled') &&
            element.closest('[hidden], [inert], [aria-hidden="true"]') ===
                null &&
            element.getClientRects().length > 0,
    )
}

export default function useCalendarPopoverLogic({
    dialogId,
    backdrop,
    onClose,
    selectedDate,
    minDate,
    maxDate,
    enableTime,
    minTime,
    maxTime,
}: CalendarPopoverProps): CalendarPopoverLogicResult {
    const monthHeadingId = `${dialogId}-month-heading`
    const keyboardHelpId = `${dialogId}-keyboard-help`
    const applyDisabled =
        !calendarValueWithinDateBounds(selectedDate, minDate, maxDate) ||
        (enableTime &&
            !calendarValueHasTimeWithinBounds(selectedDate, minTime, maxTime))

    function handleDialogKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (!backdrop || event.key !== 'Tab') {
            return
        }

        const dialog = event.currentTarget
        const portalRoots = Array.from(
            document.querySelectorAll<HTMLElement>(
                '[data-calendar-dialog-portal]',
            ),
        ).filter(
            (element) =>
                element.dataset.calendarDialogPortal === dialogId &&
                element.getClientRects().length > 0,
        )
        const focusableElements = getFocusableElements(dialog)

        for (const portalRoot of portalRoots) {
            const portalStops = getFocusableElements(portalRoot)
            const openerId = portalRoot.dataset.calendarPortalOpener
            const openerIndex = focusableElements.findIndex(
                (element) => element.id === openerId,
            )
            const insertionIndex =
                openerIndex === -1 ? focusableElements.length : openerIndex + 1
            focusableElements.splice(insertionIndex, 0, ...portalStops)
        }

        const firstElement = focusableElements[0]
        const lastElement = focusableElements.at(-1)

        if (!firstElement || !lastElement) {
            event.preventDefault()
            dialog.focus()
            return
        }

        const activeElement = document.activeElement
        const activePortal = portalRoots.find((portalRoot) =>
            portalRoot.contains(activeElement),
        )
        const focusIsInDialog =
            dialog.contains(activeElement) || Boolean(activePortal)

        if (activePortal) {
            const activeIndex = focusableElements.findIndex(
                (element) =>
                    element === activeElement ||
                    element.contains(activeElement),
            )
            const portalStops = getFocusableElements(activePortal)
            const firstPortalIndex = focusableElements.indexOf(portalStops[0])
            const lastPortalIndex = focusableElements.indexOf(
                portalStops.at(-1)!,
            )
            const currentIndex =
                activeIndex !== -1
                    ? activeIndex
                    : event.shiftKey
                      ? firstPortalIndex
                      : lastPortalIndex
            const nextIndex =
                (currentIndex +
                    (event.shiftKey ? -1 : 1) +
                    focusableElements.length) %
                focusableElements.length

            event.preventDefault()
            focusableElements[nextIndex]?.focus()
            return
        }

        if (
            event.shiftKey &&
            (!focusIsInDialog ||
                activeElement === dialog ||
                activeElement === firstElement)
        ) {
            event.preventDefault()
            lastElement.focus()
        } else if (
            !event.shiftKey &&
            (!focusIsInDialog ||
                activeElement === dialog ||
                activeElement === lastElement)
        ) {
            event.preventDefault()
            firstElement.focus()
        }
    }

    function handleBackdropClick(event: MouseEvent<HTMLDivElement>) {
        event.stopPropagation()
        onClose()
    }
    return {
        state: { monthHeadingId, keyboardHelpId, applyDisabled },
        handler: { handleDialogKeyDown, handleBackdropClick },
    }
}
