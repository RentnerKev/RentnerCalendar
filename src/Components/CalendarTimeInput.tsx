import { useRef, useState } from 'react'
import { defaultCalendarDesign } from '../types.js'
import type { KeyboardEvent } from 'react'
import type { CalendarCustomDesign, CalendarTimeInputProps } from '../types.js'
import { formatTimeToString } from '../Tools/FormatFunctions.js'

function SingleTimeInput({
    date,
    label,
    onChangeDate,
    cd,
    minTime,
    maxTime,
}: {
    date: Date | null
    label?: string
    onChangeDate: (d: Date) => void
    cd: Required<CalendarCustomDesign>
    minTime?: string
    maxTime?: string
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
        let h = parseInt(newTimeStr.slice(0, 2), 10)
        let m = parseInt(newTimeStr.slice(2, 4), 10)

        const timeInMins = h * 60 + m

        if (minTime) {
            const [minH, minM] = minTime.split(':').map(Number)
            if (timeInMins < minH * 60 + minM) {
                h = minH
                m = minM
                newTimeStr = `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`
            }
        }

        if (maxTime) {
            const [maxH, maxM] = maxTime.split(':').map(Number)
            if (timeInMins > maxH * 60 + maxM) {
                h = maxH
                m = maxM
                newTimeStr = `${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`
            }
        }

        setTimeStr(newTimeStr)

        const newDate = date ? new Date(date) : new Date()
        newDate.setHours(h, m, 0, 0)
        onChangeDate(newDate)
    }

    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        if (cursorPos === null) return

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
            const val = parseInt(e.key, 10)

            if (cursorPos === 0 && val > 2) return
            if (cursorPos === 1 && parseInt(timeStr[0]) === 2 && val > 3) return
            if (cursorPos === 2 && val > 5) return

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
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                    if (cursorPos === null) setCursorPos(0)
                }}
                onBlur={() => setCursorPos(null)}
                className={`relative flex items-center justify-center bg-transparent border ${cd.borderColor} rounded-lg px-3 py-1.5 ${cd.primaryFocusBorder} ${cd.primaryRing} transition-all shadow-sm cursor-text outline-none`}
            >
                <div
                    className={`flex items-center ${cd.textColor} text-[15px] font-medium gap-0.5`}
                >
                    <Digit
                        char={timeStr[0]}
                        isActive={cursorPos === 0}
                        onClick={() => setCursorPos(0)}
                        cd={cd}
                    />
                    <Digit
                        char={timeStr[1]}
                        isActive={cursorPos === 1}
                        onClick={() => setCursorPos(1)}
                        cd={cd}
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
                    />
                    <Digit
                        char={timeStr[3]}
                        isActive={cursorPos === 3}
                        onClick={() => setCursorPos(3)}
                        cd={cd}
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
}: {
    char: string
    isActive: boolean
    onClick: () => void
    cd: Required<CalendarCustomDesign>
}) {
    return (
        <span
            onClick={(e) => {
                e.stopPropagation()
                onClick()
            }}
            className={`w-3 text-center border-b-[1.5px] cursor-pointer transition-colors ${isActive ? `${cd.primaryBorder} ${cd.primaryColor}` : cd.borderTransparent}`}
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
}: CalendarTimeInputProps) {
    const cd = { ...defaultCalendarDesign, ...customDesign }

    const handleUpdate = (index: number, newDate: Date) => {
        if (enableRange && Array.isArray(value)) {
            const newValue = [...value] as [Date | null, Date | null]
            newValue[index] = newDate
            onChange(newValue)
        } else {
            onChange(newDate)
        }
    }

    return (
        <div
            className={`mt-4 pt-4 border-t ${cd.borderColor} flex justify-around gap-4`}
        >
            {enableRange && Array.isArray(value) ? (
                <>
                    <SingleTimeInput
                        date={value[0]}
                        label="Von"
                        onChangeDate={(d) => handleUpdate(0, d)}
                        cd={cd}
                        minTime={minTime}
                        maxTime={maxTime}
                    />
                    <SingleTimeInput
                        date={value[1]}
                        label="Bis"
                        onChangeDate={(d) => handleUpdate(1, d)}
                        cd={cd}
                        minTime={minTime}
                        maxTime={maxTime}
                    />
                </>
            ) : (
                <SingleTimeInput
                    date={value as Date}
                    label="Zeit"
                    onChangeDate={(d) => handleUpdate(0, d)}
                    cd={cd}
                    minTime={minTime}
                    maxTime={maxTime}
                />
            )}
        </div>
    )
}
