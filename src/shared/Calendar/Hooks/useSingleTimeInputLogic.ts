import type { SingleTimeInputLogicResult } from '../Types/SingleTimeInputLogicResult.types.ts'
import { useRef, useState, type KeyboardEvent } from 'react'
import { formatTimeToString } from '../../../lib/Calendar/FormatFunctions.ts'
import { updateCalendarTime } from '../../../lib/Calendar/CalendarTime.ts'
import type { SingleTimeInputProps } from '../Types/CalendarTimeInput.types.ts'

export default function useSingleTimeInputLogic({
    date,
    onChangeDate,
    minTime,
    maxTime,
    disabled = false,
    readOnly = false,
}: SingleTimeInputProps): SingleTimeInputLogicResult {
    const [timeStr, setTimeStr] = useState(() => formatTimeToString(date))
    const [prevDate, setPrevDate] = useState(date)
    const [cursorPos, setCursorPos] = useState<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

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

        setTimeStr(update.time)
        if (date?.getTime() === update.date.getTime()) return true

        onChangeDate(update.date)
        return true
    }

    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (disabled || readOnly || cursorPos === null) return

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
        handler: { handleKeyDown, handleFocus, handleBlur },
        setter: { setCursorPos },
        refs: { containerRef },
    }
}
