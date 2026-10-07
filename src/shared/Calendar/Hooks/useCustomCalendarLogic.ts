import type { CustomCalendarLogicResult } from '../Types/CustomCalendarLogicResult.types.js'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.js'
import type {
    CSSProperties,
    FocusEvent,
    InvalidEvent,
    MouseEvent,
    RefCallback,
} from 'react'
import type { CalendarProps, CalendarValue } from '../Types/Calendar.types.js'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.js'
import useCalendarPosition from './useCalendarPosition.js'
import useCalendarSelection from './useCalendarSelection.js'
import {
    commitCalendarSelection,
    shouldCloseCalendarAfterSelection,
} from '../../../lib/Calendar/CalendarCommit.js'
import { formatCalendarValue } from '../../../lib/Calendar/FormatFunctions.js'
import { serializeCalendarValue } from '../../../lib/Calendar/CalendarValue.js'
import { calendarValueHasTimeWithinBounds } from '../../../lib/Calendar/CalendarTime.js'
import { calendarValueWithinDateBounds } from '../../../lib/Calendar/CalendarDay.js'
import {
    mergeAriaIds,
    resolveCalendarFieldError,
} from '../../../lib/Calendar/CalendarField.js'
import { extractRadius } from '../../../lib/Calendar/design.js'
import { normalizeValue, parseToDate } from '../../../lib/Calendar/date.js'
import { useCalendarDefaults } from './useCalendarDefaults.js'
import { composeRefs } from './composeRefs.js'

const calendarPopoverMinWidth = 340

function hasWidthUtilityClass(className: string) {
    return className.split(/\s+/).some((classToken) => {
        let squareBracketDepth = 0
        let roundBracketDepth = 0
        let lastVariantSeparator = -1

        for (let index = 0; index < classToken.length; index += 1) {
            const character = classToken[index]

            if (character === '\\') {
                index += 1
                continue
            }

            if (character === '[') squareBracketDepth += 1
            else if (character === ']') {
                squareBracketDepth = Math.max(0, squareBracketDepth - 1)
            } else if (character === '(') roundBracketDepth += 1
            else if (character === ')') {
                roundBracketDepth = Math.max(0, roundBracketDepth - 1)
            } else if (
                character === ':' &&
                squareBracketDepth === 0 &&
                roundBracketDepth === 0
            ) {
                lastVariantSeparator = index
            }
        }

        const utility = classToken.slice(lastVariantSeparator + 1)
        return utility.replace(/^!/, '').startsWith('w-')
    })
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

export default function useCustomCalendarLogic({
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
    customDesign: providedCustomDesign,
    closeOnSelect = false,
    minDate: rawMinDate,
    maxDate: rawMaxDate,
    minTime,
    maxTime,
    fastEdit = true,
    weekStartsOn = 1,
    visibleDays = 7,
    showHolidays = false,
    locale: providedLocale,
    messages: providedMessages,
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
}: CalendarProps): CustomCalendarLogicResult {
    const defaults = useCalendarDefaults()
    const locale = providedLocale ?? defaults.locale ?? 'de'
    const messageOverrides = useMemo(
        () => ({
            ...defaults.messages,
            ...providedMessages,
            holidayNames: {
                ...defaults.messages?.holidayNames,
                ...providedMessages?.holidayNames,
            },
        }),
        [defaults.messages, providedMessages],
    )
    const customDesign = {
        ...defaults.customDesign,
        ...providedCustomDesign,
    }
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
        useCalendarPosition(triggerRef, {
            minWidth: calendarPopoverMinWidth,
            matchTriggerWidth: hasWidthUtilityClass(className),
        })
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
        width: `${coords.width}px`,
        minWidth: `${coords.width}px`,
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
        if (!isOpen || !backdrop || disabled || readOnly) return

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [backdrop, disabled, isOpen, readOnly])

    useEffect(() => {
        if (!isOpen) return

        const updatePosition = positionHandler.updatePosition
        updatePosition()
        window.addEventListener('resize', updatePosition)
        function handleScroll(event: Event) {
            const target = event.target
            // Only viewport or trigger ancestors can move this fixed popup.
            if (target === window || target === document) {
                updatePosition()
                return
            }
            if (!(target instanceof Element)) return
            let anchor: Node | null = triggerRef.current
            while (anchor) {
                if (target.contains(anchor)) {
                    updatePosition()
                    return
                }
                // Node.contains does not cross a shadow boundary. Scrolling a
                // host (or its ancestors) still moves the trigger inside it.
                const root = anchor.getRootNode()
                anchor = root instanceof ShadowRoot ? root.host : null
            }
        }
        window.addEventListener('scroll', handleScroll, true)

        return () => {
            window.removeEventListener('resize', updatePosition)
            window.removeEventListener('scroll', handleScroll, true)
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

        const shouldFocusInitialDay = !wasOpenRef.current
        wasOpenRef.current = true
        if (shouldFocusInitialDay) {
            queueMicrotask(() => {
                const initialDay =
                    popoverRef.current?.querySelector<HTMLElement>(
                        '[data-calendar-day][tabindex="0"]',
                    )
                ;(initialDay ?? popoverRef.current)?.focus()
            })
        }

        function handleEscape(event: KeyboardEvent) {
            if (event.key !== 'Escape' || event.defaultPrevented) return

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

    const { handler, state } = useCalendarSelection(
        tempValue,
        handleTempChange,
        isRangeMode,
        enableTime,
        weekStartsOn,
        visibleDays,
        minDate,
        maxDate,
        minTime,
        maxTime,
    )

    function handleApply() {
        if (disabled || readOnly) {
            return
        }

        if (!calendarValueWithinDateBounds(tempValue, minDate, maxDate)) {
            return
        }

        if (
            enableTime &&
            !calendarValueHasTimeWithinBounds(tempValue, minTime, maxTime)
        ) {
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
        const nextTargetPortal =
            nextTarget instanceof Element
                ? nextTarget.closest('[data-calendar-dialog-portal]')
                : null
        const isRadixFocusGuard =
            nextTarget instanceof Element &&
            nextTarget.closest('[data-radix-focus-guard]') !== null

        if (
            nextTarget instanceof Node &&
            (event.currentTarget.contains(nextTarget) ||
                popoverRef.current?.contains(nextTarget) ||
                nextTargetPortal?.getAttribute(
                    'data-calendar-dialog-portal',
                ) === dialogId)
        ) {
            return
        }

        if (nextTarget === null || isRadixFocusGuard) {
            const currentTarget = event.currentTarget

            window.setTimeout(() => {
                const activeTarget = document.activeElement
                const activeTargetPortal =
                    activeTarget instanceof Element
                        ? activeTarget.closest('[data-calendar-dialog-portal]')
                        : null

                if (
                    activeTarget instanceof Node &&
                    (currentTarget.contains(activeTarget) ||
                        popoverRef.current?.contains(activeTarget) ||
                        activeTargetPortal?.getAttribute(
                            'data-calendar-dialog-portal',
                        ) === dialogId)
                ) {
                    return
                }

                Object.assign(event, {
                    currentTarget,
                    relatedTarget: activeTarget,
                })
                onBlur?.(event)
            }, 0)
            return
        }

        onBlur?.(event)
    }

    const setTriggerRef: RefCallback<HTMLButtonElement> = useCallback(
        (element: HTMLButtonElement | null) =>
            composeRefs(triggerRef, forwardedTriggerRef)(element),
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

    return {
        state: {
            field: {
                ariaLabel,
                ariaLabelledBy: labelledBy,
                ariaDescribedBy: describedBy,
                ariaProps,
                cd,
                description,
                descriptionId,
                dialogId,
                disabled,
                displayValue,
                formValue,
                error,
                errorId,
                fieldId,
                hasError,
                icon,
                inputClasses,
                inputStyle,
                isDeletable,
                isOpen,
                label,
                labelId,
                messages,
                name,
                readOnly,
                resolvedPlaceholder,
                resolvedRadius,
                validationRequired:
                    required && !disabled && externalError === undefined,
            },
            popover: {
                backdrop,
                dialogId,
                className: popoverClasses,
                style: popoverStyle,
                labelledBy,
                describedBy,
                dialogLabel: messages.openCalendar,
                switchMode,
                isRangeMode,
                disabled,
                readOnly,
                messages,
                currentDate: state.viewDate,
                fastEdit,
                customDesign: cd,
                selectedDate: state.internalValue,
                minDate,
                maxDate,
                weekStartsOn,
                visibleDays,
                showHolidays,
                locale,
                enableTime,
                minTime,
                maxTime,
                button,
            },
        },
        handler: {
            closeCalendar,
            handleClear,
            handleFieldBlur,
            handleInvalid,
            toggleCalendar,
            handleApply,
            handlePrevMonth: handler.handlePrevMonth,
            handleNextMonth: handler.handleNextMonth,
            handleViewDateChange: handler.handleViewDateChange,
            handleGetDaysInMonth: handler.handleGetDaysInMonth,
            handleDateSelect: handler.handleDateSelect,
            handleTimeChange: handler.handleTimeChange,
        },
        setter: { setIsRangeMode },
        refs: { popoverRef, validationInputRef, setTriggerRef },
    }
}
