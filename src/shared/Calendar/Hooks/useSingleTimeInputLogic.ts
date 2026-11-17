import type { SingleTimeInputLogicResult } from '../Types/SingleTimeInputLogicResult.types.ts'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type {
    ChangeEvent,
    ClipboardEvent,
    MouseEvent,
    KeyboardEvent,
} from 'react'
import { formatTimeToString } from '../../../lib/Calendar/FormatFunctions.ts'
import { constrainCalendarDateTime } from '../../../lib/Calendar/CalendarDateTime.ts'
import { updateCalendarTime } from '../../../lib/Calendar/CalendarTime.ts'
import type { SingleTimeInputProps } from '../Types/CalendarTimeInput.types.ts'

const useBrowserLayoutEffect =
    typeof window === 'undefined' ? useEffect : useLayoutEffect

export default function useSingleTimeInputLogic({
    date,
    onChangeDate,
    minDateTime,
    maxDateTime,
    minTime,
    maxTime,
    disabled = false,
    readOnly = false,
}: SingleTimeInputProps): SingleTimeInputLogicResult {
    const [timeStr, setTimeStr] = useState(() => formatTimeToString(date))
    const [prevDate, setPrevDate] = useState(date)
    const [cursorPos, setCursorPos] = useState<number | null>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    if (date !== prevDate) {
        setPrevDate(date)
        setTimeStr(formatTimeToString(date))
    }

    function updateDate(newTimeStr: string) {
        if (disabled || readOnly) return false

        // Keep partially edited values local until all four digits form a
        // valid time. This lets users replace an hour such as 19 with 23
        // without briefly passing 29 to Date#setHours and rolling the day.
        setTimeStr(newTimeStr)
        const update = updateCalendarTime(date, newTimeStr, minTime, maxTime)
        if (!update) return false

        const constrained = constrainCalendarDateTime(
            update.date,
            minDateTime,
            maxDateTime,
            minTime,
            maxTime,
        )
        if (!constrained) return false
        update.date = constrained
        update.time = formatTimeToString(constrained)
        setTimeStr(update.time)
        if (date?.getTime() === update.date.getTime()) return true

        onChangeDate(update.date)
        return true
    }

    useBrowserLayoutEffect(() => {
        const input = inputRef.current
        if (cursorPos !== null && input?.matches(':focus')) {
            input.setSelectionRange(cursorPos, cursorPos + 1)
        }
    }, [cursorPos, timeStr])

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        if (disabled || readOnly) return
        const value = event.currentTarget.value
        const nativeEvent = event.nativeEvent as InputEvent
        if (/^\d{4}$/.test(value)) {
            updateDate(value)
            setCursorPos(Math.min(3, event.currentTarget.selectionStart ?? 0))
        } else if (nativeEvent.inputType?.startsWith('delete')) {
            const position = cursorPos ?? 0
            updateDate(
                timeStr.slice(0, position) + '0' + timeStr.slice(position + 1),
            )
        } else if (nativeEvent.data && /^\d$/.test(nativeEvent.data)) {
            const position = cursorPos ?? 0
            updateDate(
                timeStr.slice(0, position) +
                    nativeEvent.data +
                    timeStr.slice(position + 1),
            )
            setCursorPos(Math.min(3, position + 1))
        }
        // Restore the controlled draft even when an unsupported edit made no state change.
        event.currentTarget.value = timeStr
    }

    function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
        if (disabled || readOnly) return
        event.preventDefault()
        const value = event.clipboardData.getData('text/plain').trim()
        if (/^\d{2}:?\d{2}$/.test(value)) {
            updateDate(value.replace(':', ''))
            setCursorPos(3)
        }
    }

    function handleClick(event: MouseEvent<HTMLInputElement>) {
        if (disabled || readOnly) return
        const digits =
            event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(
                '[data-time-digit]',
            )
        let position = Math.min(3, event.currentTarget.selectionStart ?? 0)
        let distance = Infinity
        for (const digit of digits ?? []) {
            const rect = digit.getBoundingClientRect()
            const nextDistance = Math.abs(
                event.clientX - rect.left - rect.width / 2,
            )
            if (nextDistance < distance) {
                position = Number(digit.dataset.timeDigit)
                distance = nextDistance
            }
        }
        setCursorPos(position)
        inputRef.current?.setSelectionRange(position, position + 1)
    }

    function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
        if (
            disabled ||
            readOnly ||
            cursorPos === null ||
            e.altKey ||
            e.ctrlKey ||
            e.metaKey ||
            e.nativeEvent.isComposing
        )
            return

        if (e.key === 'ArrowLeft') {
            e.preventDefault()
            setCursorPos(Math.max(0, cursorPos - 1))
        } else if (e.key === 'ArrowRight') {
            e.preventDefault()
            setCursorPos(Math.min(3, cursorPos + 1))
        } else if (e.key === 'Backspace') {
            e.preventDefault()
            const targetPos =
                cursorPos > 0 && timeStr[cursorPos] === '0'
                    ? cursorPos - 1
                    : cursorPos
            const newStr =
                timeStr.substring(0, targetPos) +
                '0' +
                timeStr.substring(targetPos + 1)
            updateDate(newStr)
            setCursorPos(targetPos)
        } else if (e.key === 'Delete') {
            e.preventDefault()
            const newStr =
                timeStr.substring(0, cursorPos) +
                '0' +
                timeStr.substring(cursorPos + 1)
            updateDate(newStr)
        } else if (/^[0-9]$/.test(e.key)) {
            e.preventDefault()
            const newStr =
                timeStr.substring(0, cursorPos) +
                e.key +
                timeStr.substring(cursorPos + 1)
            updateDate(newStr)

            if (cursorPos < 3) {
                setCursorPos(cursorPos + 1)
            }
        }
    }

    function handleFocus() {
        if (!disabled && !readOnly && cursorPos === null) setCursorPos(0)
    }
    function handleBlur() {
        setTimeStr(formatTimeToString(date))
        setCursorPos(null)
    }
    return {
        state: { timeStr, cursorPos },
        handler: {
            handleKeyDown,
            handleFocus,
            handleBlur,
            handleChange,
            handlePaste,
            handleClick,
        },
        refs: { inputRef },
    }
}
