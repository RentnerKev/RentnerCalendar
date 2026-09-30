import { useRef, useState } from 'react'
import { defaultCalendarDesign } from '../types.js'
import type { KeyboardEvent } from 'react'
import type { CalendarCustomDesign, CalendarTimeInputProps } from '../types.js'
import { resolveCalendarMessages } from '../messages.js'
import { formatTimeToString } from '../Tools/FormatFunctions.js'
import { updateCalendarTime } from '../Tools/CalendarTime.js'
import { updateCalendarRangeBoundary } from '../Tools/CalendarSelection.js'

function SingleTimeInput({
    date,
    label,
    onChangeDate,
    cd,
    minTime,
    maxTime,
    disabled = false,
    readOnly = false,
}: {
    date: Date | null
    label?: string
    onChangeDate: (d: Date) => void
    cd: Required<CalendarCustomDesign>
    minTime?: string
    maxTime?: string
    disabled?: boolean
    readOnly?: boolean
}) {
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

    return (
        <div className="flex flex-col gap-1 items-center">
            {label && (
                <span
                    className={`text-[10px] ${cd.textMuted} font-bold uppercase tracking-wider`}
                >
                    {label}
                </span>
            )}
            <div
                ref={containerRef}
                tabIndex={disabled || readOnly ? -1 : 0}
                role="textbox"
                aria-label={`${label ?? 'Time'} ${timeStr.slice(0, 2)}:${timeStr.slice(2)}`}
                aria-disabled={disabled || undefined}
                aria-readonly={readOnly || undefined}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (!disabled && !readOnly && cursorPos === null) {
                        setCursorPos(0)
                    }
                }}
                onBlur={() => {
                    setTimeStr(formatTimeToString(date))
                    setCursorPos(null)
                }}
                className={`relative flex items-center justify-center bg-transparent border ${cd.borderColor} rounded-lg px-3 py-1.5 ${cd.primaryFocusBorder} ${cd.primaryRing} transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${disabled || readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
            >
                <div
                    className={`flex items-center ${cd.textColor} text-[15px] font-medium gap-0.5`}
                >
                    <Digit
                        char={timeStr[0]}
                        isActive={cursorPos === 0}
                        onClick={() => setCursorPos(0)}
                        cd={cd}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <Digit
                        char={timeStr[1]}
                        isActive={cursorPos === 1}
                        onClick={() => setCursorPos(1)}
                        cd={cd}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <span
                        className={`mx-0.5 pb-0.5 ${cd.textMutedDark} font-bold`}
                    >
                        :
                    </span>
                    <Digit
                        char={timeStr[2]}
                        isActive={cursorPos === 2}
                        onClick={() => setCursorPos(2)}
                        cd={cd}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <Digit
                        char={timeStr[3]}
                        isActive={cursorPos === 3}
                        onClick={() => setCursorPos(3)}
                        cd={cd}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </div>
            </div>
        </div>
    )
}

function Digit({
    char,
    isActive,
    onClick,
    cd,
    disabled = false,
    readOnly = false,
}: {
    char: string
    isActive: boolean
    onClick: () => void
    cd: Required<CalendarCustomDesign>
    disabled?: boolean
    readOnly?: boolean
}) {
    return (
        <span
            aria-hidden="true"
            onClick={(e) => {
                e.stopPropagation()
                if (!disabled && !readOnly) onClick()
            }}
            className={`w-3 text-center border-b-[1.5px] ${disabled || readOnly ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors ${isActive ? `${cd.primaryBorder} ${cd.primaryColor}` : cd.borderTransparent}`}
        >
            {char}
        </span>
    )
}

export default function CalendarTimeInput({
    value,
    onChange,
    enableRange,
    customDesign = defaultCalendarDesign,
    minTime,
    maxTime,
    messages: providedMessages,
    disabled = false,
    readOnly = false,
}: CalendarTimeInputProps) {
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const messages = providedMessages ?? resolveCalendarMessages()

    const handleUpdate = (index: 0 | 1, newDate: Date) => {
        if (disabled || readOnly) {
            return
        }

        if (enableRange) {
            const range = Array.isArray(value)
                ? value
                : ([null, null] as [null, null])
            onChange(updateCalendarRangeBoundary(range, index, newDate))
        } else {
            onChange(newDate)
        }
    }

    const rangeValue = Array.isArray(value) ? value : [null, null]
    const singleDate = value instanceof Date ? value : null

    return (
        <div
            className={`mt-4 pt-4 border-t ${cd.borderColor} flex justify-around gap-4`}
        >
            {enableRange ? (
                <>
                    <SingleTimeInput
                        date={rangeValue[0]}
                        label={messages.from}
                        onChangeDate={(d) => handleUpdate(0, d)}
                        cd={cd}
                        minTime={minTime}
                        maxTime={maxTime}
                        disabled={disabled || !rangeValue[0]}
                        readOnly={readOnly}
                    />
                    <SingleTimeInput
                        date={rangeValue[1]}
                        label={messages.to}
                        onChangeDate={(d) => handleUpdate(1, d)}
                        cd={cd}
                        minTime={minTime}
                        maxTime={maxTime}
                        disabled={disabled || !rangeValue[1]}
                        readOnly={readOnly}
                    />
                </>
            ) : (
                <SingleTimeInput
                    date={singleDate}
                    label={messages.time}
                    onChangeDate={(d) => handleUpdate(0, d)}
                    cd={cd}
                    minTime={minTime}
                    maxTime={maxTime}
                    disabled={disabled || !singleDate}
                    readOnly={readOnly}
                />
            )}
        </div>
    )
}
