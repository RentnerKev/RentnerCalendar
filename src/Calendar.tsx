import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CustomTooltip } from './Internal/Tooltip.js'
import { defaultCalendarDesign } from './types.js'
import type { CSSProperties, InvalidEvent, MouseEvent } from 'react'
import type { CalendarProps, CalendarValue } from './types.js'
import CalendarHeader from './Components/CalendarHeader.js'
import CalendarGrid from './Components/CalendarGrid.js'
import CalendarTimeInput from './Components/CalendarTimeInput.js'
import useCalendarLogic from './Hooks/useCalendarLogic.js'
import {
    commitCalendarSelection,
    shouldCloseCalendarAfterSelection,
} from './Tools/CalendarCommit.js'
import { formatCalendarValue } from './Tools/FormatFunctions.js'
import { AlertCircle, CalendarDays, X } from 'lucide-react'
import {
    extractRadius,
    normalizeValue,
    parseToDate,
} from './Tools/InternalOnlyFunctions.js'

const calendarPopoverMinWidth = 340

function hasCalendarValue(value?: CalendarValue) {
    if (!value) {
        return false
    }

    if (Array.isArray(value)) {
        return Boolean(value[0] && value[1])
    }

    return true
}

export function CustomCalendar({
    id,
    name,
    value: rawValue,
    onChange,
    required = false,
    enableTime = false,
    enableRange = false,
    switchMode = false,
    isDeletable = false,
    className = '',
    icon,
    backdrop = true,
    button = false,
    placeholder = 'Klicke hier um die Auswahlen zu sehen!',
    customDesign = defaultCalendarDesign,
    closeOnSelect = false,
    minDate: rawMinDate,
    maxDate: rawMaxDate,
    minTime,
    maxTime,
    fastEdit = true,
    weekStartsOn = 1,
    visibleDays = 7,
    showHolidays = false,
}: CalendarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isRangeMode, setIsRangeMode] = useState(enableRange)
    const [isTouched, setIsTouched] = useState(false)

    const normalizedValue = useMemo(() => normalizeValue(rawValue), [rawValue])
    const minDate = useMemo(
        () => parseToDate(rawMinDate) || undefined,
        [rawMinDate],
    )
    const maxDate = useMemo(
        () => parseToDate(rawMaxDate) || undefined,
        [rawMaxDate],
    )

    const [tempValue, setTempValue] = useState(normalizedValue)
    const [prevRawValue, setPrevRawValue] = useState(rawValue)
    const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>(
        'bottom',
    )

    const [coords, setCoords] = useState({
        top: 0,
        bottom: 0,
        left: 0,
        width: 0,
        maxHeight: 0,
    })

    if (rawValue !== prevRawValue) {
        setPrevRawValue(rawValue)
        setTempValue(normalizedValue)
    }

    const triggerRef = useRef<HTMLDivElement>(null)
    const validationInputRef = useRef<HTMLInputElement>(null)
    const cd = { ...defaultCalendarDesign, ...customDesign }

    const resolvedRadius = extractRadius(className) ?? '0.75rem'
    const error =
        required && !hasCalendarValue(normalizedValue)
            ? 'Dieses Feld ist erforderlich'
            : null
    const hasError = isTouched && error !== null

    const inputStyle: CSSProperties = {
        borderWidth: '1px',
    }

    const popoverStyle: CSSProperties = {
        position: 'absolute',
        top: dropdownPosition === 'bottom' ? `${coords.top}px` : 'auto',
        bottom: dropdownPosition === 'top' ? `${coords.bottom}px` : 'auto',
        left: `${coords.left}px`,
        width: className.match(/w-/)
            ? `${coords.width}px`
            : `${calendarPopoverMinWidth}px`,
        minWidth: `${calendarPopoverMinWidth}px`,
        maxHeight: `${coords.maxHeight}px`,
        borderRadius: resolvedRadius,
        borderWidth: '1px',
    }

    const inputClasses = [
        'relative flex items-center px-4 gap-3 shadow-sm transition-all cursor-pointer group outline-none',
        hasError
            ? 'border-red-500 focus:ring-2 focus:ring-red-500/50'
            : cd.borderColor,
        cd.inputBackground,
        hasError ? '' : cd.primaryColorFocusWithin,
        hasError ? '' : cd.primaryFocusBorder,
        hasError ? '' : cd.primaryRing,
        !className.includes('h-') ? 'h-[2.75rem]' : '',
        !className.includes('rounded') ? 'rounded-[0.75rem]' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const popoverClasses = [
        'z-[9000] p-4 shadow-xl overflow-y-auto scrollbar-thin scrollbar-thumb-gray-500 scrollbar-track-gray-200',
        cd.surfaceBackground,
        cd.borderColor,
        dropdownPosition === 'top'
            ? 'slide-in-from-bottom-2 origin-bottom'
            : 'slide-in-from-top-2 origin-top',
    ]
        .filter(Boolean)
        .join(' ')

    useEffect(() => {
        validationInputRef.current?.setCustomValidity(error || '')
    }, [error])

    useEffect(() => {
        const input = validationInputRef.current
        const form = input?.form

        if (!input || !form) {
            return
        }

        const currentInput = input

        function handleFormSubmit() {
            if (currentInput.validity.valid) {
                setIsTouched(false)
            }
        }

        form.addEventListener('submit', handleFormSubmit)

        return () => {
            form.removeEventListener('submit', handleFormSubmit)
        }
    }, [])

    useEffect(() => {
        if (!isOpen) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [isOpen])

    function closeCalendar() {
        setTempValue(normalizedValue)
        setIsOpen(false)
    }

    function toggleCalendar() {
        const nextState = !isOpen

        if (!nextState) {
            closeCalendar()
            return
        }

        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top

            const estimatedCalendarHeight = 450

            let pos: 'bottom' | 'top' = 'bottom'

            if (
                spaceBelow < estimatedCalendarHeight &&
                spaceAbove > spaceBelow
            ) {
                pos = 'top'
            }

            setDropdownPosition(pos)

            setCoords({
                left: rect.left + window.scrollX,
                top: rect.bottom + window.scrollY + 8,
                bottom: window.innerHeight - rect.top - window.scrollY + 8,
                width: rect.width,
                maxHeight:
                    pos === 'bottom'
                        ? Math.max(spaceBelow - 16, 250)
                        : Math.max(spaceAbove - 16, 250),
            })
        }

        setIsOpen(true)
    }

    function handleTempChange(newVal: CalendarValue, source?: 'date' | 'time') {
        setTempValue(newVal)
        commitCalendarSelection(newVal, onChange, {
            backdrop,
            button,
            closeOnSelect,
        })

        if (
            shouldCloseCalendarAfterSelection(newVal, {
                button,
                closeOnSelect,
                isRangeMode,
                source,
            })
        ) {
            closeCalendar()
        }
    }

    const { handler, state } = useCalendarLogic(
        tempValue,
        handleTempChange,
        isRangeMode,
        enableTime,
        weekStartsOn,
        visibleDays,
        minDate,
        maxDate,
    )

    function handleApply() {
        onChange?.(tempValue)
        closeCalendar()
    }

    function handleClear(e: MouseEvent) {
        e.stopPropagation()
        setTempValue(undefined)
        onChange?.(undefined)
    }

    function handleInvalid(event: InvalidEvent<HTMLInputElement>) {
        event.preventDefault()
        setIsTouched(true)
    }

    const displayValue = normalizedValue
        ? formatCalendarValue(normalizedValue)
        : ''

    const popoverContent = isOpen ? (
        <>
            {backdrop && (
                <div
                    className="fixed inset-0 z-[8999]"
                    onClick={(e) => {
                        e.stopPropagation()
                        closeCalendar()
                    }}
                />
            )}
            <div
                className={popoverClasses}
                style={popoverStyle}
                onClick={(e) => e.stopPropagation()}
            >
                {switchMode && (
                    <div
                        className={`flex items-center justify-between p-1 mb-4 rounded-lg bg-black/20 ${cd.borderColor} border`}
                    >
                        <button
                            type="button"
                            onClick={() => setIsRangeMode(false)}
                            className={`flex-1 cursor-pointer py-1.5 text-sm font-medium rounded-md transition-all ${!isRangeMode ? `${cd.primaryBg} text-white shadow-sm` : `${cd.textMuted} ${cd.hoverText} hover:bg-white/5`}`}
                        >
                            Tag
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsRangeMode(true)}
                            className={`flex-1 cursor-pointer py-1.5 text-sm font-medium rounded-md transition-all ${isRangeMode ? `${cd.primaryBg} text-white shadow-sm` : `${cd.textMuted} ${cd.hoverText} hover:bg-white/5`}`}
                        >
                            Zeitraum
                        </button>
                    </div>
                )}

                <CalendarHeader
                    currentDate={state.viewDate}
                    onPrevMonth={handler.handlePrevMonth}
                    onNextMonth={handler.handleNextMonth}
                    onViewDateChange={handler.handleViewDateChange}
                    fastEdit={fastEdit}
                    customDesign={cd}
                />

                <CalendarGrid
                    handleGetDaysInMonth={handler.handleGetDaysInMonth}
                    selectedDate={state.internalValue}
                    onSelectDate={handler.handleDateSelect}
                    enableRange={isRangeMode}
                    customDesign={cd}
                    minDate={minDate}
                    maxDate={maxDate}
                    weekStartsOn={weekStartsOn}
                    visibleDays={visibleDays}
                    showHolidays={showHolidays}
                />

                {enableTime && (
                    <CalendarTimeInput
                        value={state.internalValue}
                        onChange={handler.handleTimeChange}
                        enableRange={isRangeMode}
                        customDesign={cd}
                        minTime={minTime}
                        maxTime={maxTime}
                    />
                )}

                {button && (
                    <button
                        type="button"
                        onClick={handleApply}
                        className={`w-full cursor-pointer mt-4 py-2 rounded-lg text-white font-medium transition-colors ${cd.primaryBg} ${cd.primaryHover}`}
                    >
                        Anwenden
                    </button>
                )}
            </div>
        </>
    ) : null

    return (
        <div
            id={id}
            ref={triggerRef}
            className={inputClasses}
            style={inputStyle}
            onClick={toggleCalendar}
            tabIndex={0}
            aria-invalid={hasError}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCalendar()
                }
            }}
        >
            <input
                ref={validationInputRef}
                name={name}
                value={displayValue}
                onChange={() => undefined}
                onInvalid={handleInvalid}
                required={required}
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-none absolute h-px w-px opacity-0"
            />
            {hasError ? (
                <CustomTooltip content={error || ''} side="bottom">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                </CustomTooltip>
            ) : (
                icon !== false &&
                (icon || <CalendarDays className={`w-5 h-5 ${cd.textMuted}`} />)
            )}
            <span
                className={`flex-1 truncate ${displayValue ? cd.textColor : cd.textMuted}`}
            >
                {displayValue || placeholder}
            </span>

            {isDeletable && displayValue && (
                <div
                    onClick={handleClear}
                    style={{ borderRadius: resolvedRadius }}
                    className="p-1 bg-red-500/50 hover:bg-red-500/40 transition-colors group/delete"
                >
                    <X className="w-4 h-4" />
                </div>
            )}

            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(popoverContent, document.body)}
        </div>
    )
}
