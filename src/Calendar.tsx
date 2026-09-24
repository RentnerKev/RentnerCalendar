import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { defaultCalendarDesign } from './types.js'
import type {
    CSSProperties,
    FocusEvent,
    InvalidEvent,
    MouseEvent,
    MutableRefObject,
    Ref,
} from 'react'
import type { CalendarProps, CalendarValue } from './types.js'
import { resolveCalendarMessages } from './messages.js'
import CalendarPopover from './Components/CalendarPopover.js'
import useCalendarPosition from './Hooks/useCalendarPosition.js'
import useCalendarLogic from './Hooks/useCalendarLogic.js'
import {
    commitCalendarSelection,
    shouldCloseCalendarAfterSelection,
} from './Tools/CalendarCommit.js'
import { formatCalendarValue } from './Tools/FormatFunctions.js'
import { serializeCalendarValue } from './Tools/CalendarValue.js'
import {
    mergeAriaIds,
    resolveCalendarFieldError,
} from './Tools/CalendarField.js'
import {
    extractRadius,
    normalizeValue,
    parseToDate,
} from './Tools/InternalOnlyFunctions.js'
import CalendarField from './Components/CalendarField.js'

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
    getFormValue,
    formValueFormat = 'display',
    onBlur,
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
    const dialogId = `${fieldId}-dialog`

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
    if (rawValue !== prevRawValue) {
        setPrevRawValue(rawValue)
        setTempValue(normalizedValue)
    }

    if ((disabled || readOnly) && isOpen) {
        setIsOpen(false)
    }

    const triggerRef = useRef<HTMLButtonElement>(null)
    const popoverRef = useRef<HTMLDivElement>(null)
    const wasOpenRef = useRef(false)
    const validationInputRef = useRef<HTMLInputElement>(null)
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const { handler: positionHandler, state: positionState } =
        useCalendarPosition(triggerRef)
    const { dropdownPosition, coords } = positionState

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
        position: 'fixed',
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
        'relative flex items-center px-4 gap-3 shadow-sm transition-colors cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
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

    useEffect(() => {
        if (!isOpen) return

        const updatePosition = positionHandler.updatePosition
        updatePosition()
        window.addEventListener('resize', updatePosition)
        window.addEventListener('scroll', updatePosition, true)

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', updatePosition, true)
        }
    }, [isOpen, positionHandler.updatePosition])

    const closeCalendar = useCallback(() => {
        setTempValue(normalizedValue)
        setIsOpen(false)
    }, [normalizedValue])

    useEffect(() => {
        if (!isOpen) {
            if (wasOpenRef.current) {
                wasOpenRef.current = false
                queueMicrotask(() => triggerRef.current?.focus())
            }
            return
        }

        wasOpenRef.current = true
        queueMicrotask(() => popoverRef.current?.focus())

        function handleEscape(event: KeyboardEvent) {
            if (event.key !== 'Escape') return

            event.preventDefault()
            event.stopPropagation()
            closeCalendar()
        }

        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [closeCalendar, isOpen])

    function toggleCalendar() {
        if (disabled || readOnly) {
            return
        }

        const nextState = !isOpen

        if (!nextState) {
            closeCalendar()
            return
        }

        positionHandler.updatePosition()

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

    function handleFieldBlur(event: FocusEvent<HTMLDivElement>) {
        const nextTarget = event.relatedTarget

        if (
            nextTarget instanceof Node &&
            (event.currentTarget.contains(nextTarget) ||
                popoverRef.current?.contains(nextTarget))
        ) {
            return
        }

        onBlur?.(event)
    }

    const setTriggerRef = useCallback(
        (element: HTMLButtonElement | null) => {
            triggerRef.current = element
            assignRef(forwardedTriggerRef, element)
        },
        [forwardedTriggerRef],
    )

    const displayValue = normalizedValue
        ? formatCalendarValue(normalizedValue, locale)
        : ''
    let formValue = displayValue
    if (displayValue && normalizedValue) {
        if (getFormValue) {
            formValue = getFormValue(normalizedValue)
        } else if (formValueFormat !== 'display') {
            const serialized = serializeCalendarValue(normalizedValue, {
                format: formValueFormat === 'iso-date' ? 'date' : 'datetime',
            })
            formValue = Array.isArray(serialized)
                ? JSON.stringify(serialized)
                : (serialized ?? '')
        }
    }

    const popoverContent = isOpen ? (
        <CalendarPopover
            backdrop={backdrop}
            onClose={closeCalendar}
            dialogId={dialogId}
            popoverRef={popoverRef}
            className={popoverClasses}
            style={popoverStyle}
            labelledBy={labelledBy}
            describedBy={describedBy}
            dialogLabel={messages.openCalendar}
            switchMode={switchMode}
            isRangeMode={isRangeMode}
            onRangeModeChange={setIsRangeMode}
            disabled={disabled}
            readOnly={readOnly}
            messages={messages}
            currentDate={state.viewDate}
            onPrevMonth={handler.handlePrevMonth}
            onNextMonth={handler.handleNextMonth}
            onViewDateChange={handler.handleViewDateChange}
            fastEdit={fastEdit}
            customDesign={cd}
            getDaysInMonth={handler.handleGetDaysInMonth}
            selectedDate={state.internalValue}
            onSelectDate={handler.handleDateSelect}
            minDate={minDate}
            maxDate={maxDate}
            weekStartsOn={weekStartsOn}
            visibleDays={visibleDays}
            showHolidays={showHolidays}
            locale={locale}
            enableTime={enableTime}
            onTimeChange={handler.handleTimeChange}
            minTime={minTime}
            maxTime={maxTime}
            button={button}
            onApply={handleApply}
        />
    ) : null

    return (
        <CalendarField
            ariaLabel={ariaLabel}
            ariaLabelledBy={labelledBy}
            ariaDescribedBy={describedBy}
            ariaProps={ariaProps}
            cd={cd}
            description={description}
            descriptionId={descriptionId}
            dialogId={dialogId}
            disabled={disabled}
            displayValue={displayValue}
            formValue={formValue}
            error={error}
            errorId={errorId}
            fieldId={fieldId}
            handleClear={handleClear}
            handleFieldBlur={handleFieldBlur}
            handleInvalid={handleInvalid}
            hasError={hasError}
            icon={icon}
            inputClasses={inputClasses}
            inputStyle={inputStyle}
            isDeletable={isDeletable}
            isOpen={isOpen}
            label={label}
            labelId={labelId}
            messages={messages}
            name={name}
            popoverContent={popoverContent}
            readOnly={readOnly}
            resolvedPlaceholder={resolvedPlaceholder}
            resolvedRadius={resolvedRadius}
            setTriggerRef={setTriggerRef}
            toggleCalendar={toggleCalendar}
            validationInputRef={validationInputRef}
            validationRequired={
                required && !disabled && externalError === undefined
            }
        />
    )
}
