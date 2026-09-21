import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { CustomTooltip } from './Internal/Tooltip.js'
import { defaultCalendarDesign } from './types.js'
import type {
    CSSProperties,
    InvalidEvent,
    MouseEvent,
    MutableRefObject,
    Ref,
} from 'react'
import type { CalendarProps, CalendarValue } from './types.js'
import { resolveCalendarMessages } from './messages.js'
import CalendarHeader from './Components/CalendarHeader.js'
import CalendarGrid from './Components/CalendarGrid.js'
import CalendarTimeInput from './Components/CalendarTimeInput.js'
import useCalendarLogic from './Hooks/useCalendarLogic.js'
import {
    commitCalendarSelection,
    shouldCloseCalendarAfterSelection,
} from './Tools/CalendarCommit.js'
import { formatCalendarValue } from './Tools/FormatFunctions.js'
import {
    mergeAriaIds,
    resolveCalendarFieldError,
} from './Tools/CalendarField.js'
import { AlertCircle, CalendarDays, X } from 'lucide-react'
import {
    extractRadius,
    normalizeValue,
    parseToDate,
} from './Tools/InternalOnlyFunctions.js'

const calendarPopoverMinWidth = 340

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
    if (typeof ref === 'function') {
        ref(value)
    } else if (ref) {
        ;(ref as MutableRefObject<T | null>).current = value
    }
}

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
    placeholder,
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
    locale = 'de',
    messages: messageOverrides,
    label,
    description,
    error: externalError,
    disabled = false,
    readOnly = false,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    triggerRef: forwardedTriggerRef,
    ...ariaProps
}: CalendarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isRangeMode, setIsRangeMode] = useState(enableRange)
    const [isTouched, setIsTouched] = useState(false)
    const generatedId = useId()
    const fieldId = id ?? generatedId
    const labelId = `${fieldId}-label`
    const descriptionId = `${fieldId}-description`
    const errorId = `${fieldId}-error`

    const normalizedValue = useMemo(() => normalizeValue(rawValue), [rawValue])
    const messages = useMemo(
        () => resolveCalendarMessages(locale, messageOverrides),
        [locale, messageOverrides],
    )
    const resolvedPlaceholder = placeholder ?? messages.placeholder
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

    if ((disabled || readOnly) && isOpen) {
        setIsOpen(false)
    }

    const triggerRef = useRef<HTMLDivElement>(null)
    const validationInputRef = useRef<HTMLInputElement>(null)
    const cd = { ...defaultCalendarDesign, ...customDesign }

    const resolvedRadius = extractRadius(className) ?? '0.75rem'
    const internalError =
        required && !hasCalendarValue(normalizedValue)
            ? messages.required
            : null
    const error = resolveCalendarFieldError(externalError, internalError)
    const hasError =
        externalError !== undefined
            ? externalError !== null && externalError.length > 0
            : isTouched && internalError !== null
    const labelledBy = mergeAriaIds(
        ariaLabelledBy,
        label != null ? labelId : undefined,
    )
    const describedBy = mergeAriaIds(
        ariaDescribedBy,
        description != null ? descriptionId : undefined,
        hasError ? errorId : undefined,
    )

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
        disabled ? 'cursor-not-allowed opacity-60' : '',
        readOnly ? 'cursor-default' : '',
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
        if (!isOpen || disabled || readOnly) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [disabled, isOpen, readOnly])

    function closeCalendar() {
        setTempValue(normalizedValue)
        setIsOpen(false)
    }

    function toggleCalendar() {
        if (disabled || readOnly) {
            return
        }

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
        if (disabled || readOnly) {
            return
        }

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
        if (disabled || readOnly) {
            return
        }

        onChange?.(tempValue)
        closeCalendar()
    }

    function handleClear(e: MouseEvent) {
        e.stopPropagation()
        if (disabled || readOnly) {
            return
        }

        setTempValue(undefined)
        onChange?.(undefined)
    }

    function handleInvalid(event: InvalidEvent<HTMLInputElement>) {
        event.preventDefault()
        setIsTouched(true)
        triggerRef.current?.focus()
    }

    const setTriggerRef = useCallback(
        (element: HTMLDivElement | null) => {
            triggerRef.current = element
            assignRef(forwardedTriggerRef, element)
        },
        [forwardedTriggerRef],
    )

    const displayValue = normalizedValue
        ? formatCalendarValue(normalizedValue, locale)
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
                            aria-label={messages.day}
                            disabled={disabled || readOnly}
                            className={`flex-1 cursor-pointer py-1.5 text-sm font-medium rounded-md transition-all ${!isRangeMode ? `${cd.primaryBg} text-white shadow-sm` : `${cd.textMuted} ${cd.hoverText} hover:bg-white/5`}`}
                        >
                            {messages.day}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsRangeMode(true)}
                            aria-label={messages.range}
                            disabled={disabled || readOnly}
                            className={`flex-1 cursor-pointer py-1.5 text-sm font-medium rounded-md transition-all ${isRangeMode ? `${cd.primaryBg} text-white shadow-sm` : `${cd.textMuted} ${cd.hoverText} hover:bg-white/5`}`}
                        >
                            {messages.range}
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
                    messages={messages}
                    disabled={disabled}
                    readOnly={readOnly}
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
                    locale={locale}
                    messages={messages}
                    disabled={disabled}
                    readOnly={readOnly}
                />

                {enableTime && (
                    <CalendarTimeInput
                        value={state.internalValue}
                        onChange={handler.handleTimeChange}
                        enableRange={isRangeMode}
                        customDesign={cd}
                        minTime={minTime}
                        maxTime={maxTime}
                        messages={messages}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                )}

                {button && (
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={disabled || readOnly}
                        className={`w-full cursor-pointer mt-4 py-2 rounded-lg text-white font-medium transition-colors ${cd.primaryBg} ${cd.primaryHover}`}
                    >
                        {messages.apply}
                    </button>
                )}
            </div>
        </>
    ) : null

    return (
        <div className="w-full">
            {label != null && (
                <div id={labelId} className="mb-1 text-sm font-medium">
                    {label}
                </div>
            )}
            <div
                id={fieldId}
                ref={setTriggerRef}
                className={inputClasses}
                style={inputStyle}
                onClick={toggleCalendar}
                tabIndex={disabled ? -1 : 0}
                {...ariaProps}
                aria-invalid={
                    hasError || ariaProps['aria-invalid'] || undefined
                }
                aria-required={
                    disabled
                        ? undefined
                        : externalError === undefined
                          ? required || ariaProps['aria-required'] || undefined
                          : ariaProps['aria-required']
                }
                aria-errormessage={
                    hasError ? errorId : ariaProps['aria-errormessage']
                }
                aria-label={
                    ariaLabel ??
                    (labelledBy
                        ? undefined
                        : isOpen
                          ? messages.closeCalendar
                          : messages.openCalendar)
                }
                aria-labelledby={labelledBy}
                aria-describedby={describedBy}
                aria-disabled={
                    disabled || ariaProps['aria-disabled'] || undefined
                }
                aria-readonly={
                    readOnly || ariaProps['aria-readonly'] || undefined
                }
                aria-expanded={isOpen}
                aria-haspopup={ariaProps['aria-haspopup'] ?? 'dialog'}
                role="button"
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
                    required={
                        required && !disabled && externalError === undefined
                    }
                    disabled={disabled}
                    readOnly={readOnly}
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
                    (icon || (
                        <CalendarDays className={`w-5 h-5 ${cd.textMuted}`} />
                    ))
                )}
                <span
                    className={`flex-1 truncate ${displayValue ? cd.textColor : cd.textMuted}`}
                >
                    {displayValue || resolvedPlaceholder}
                </span>

                {isDeletable && displayValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label={messages.clear}
                        disabled={disabled || readOnly}
                        style={{ borderRadius: resolvedRadius }}
                        className="p-1 bg-red-500/50 hover:bg-red-500/40 transition-colors group/delete"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}

                {isOpen &&
                    typeof document !== 'undefined' &&
                    createPortal(popoverContent, document.body)}
            </div>
            {description != null && (
                <div
                    id={descriptionId}
                    className="mt-1 text-xs text-muted-foreground"
                >
                    {description}
                </div>
            )}
            {hasError && error && (
                <span id={errorId} className="sr-only">
                    {error}
                </span>
            )}
        </div>
    )
}
