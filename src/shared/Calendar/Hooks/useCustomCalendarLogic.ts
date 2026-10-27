import type { CustomCalendarLogicResult } from '../Types/CustomCalendarLogicResult.types.ts'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.ts'
import type {
    CSSProperties,
    FocusEvent,
    InvalidEvent,
    MouseEvent,
    RefCallback,
} from 'react'
import type {
    CalendarInternalProps,
    CalendarValue,
} from '../Types/Calendar.types.ts'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.ts'
import useCalendarPosition from './useCalendarPosition.ts'
import useCalendarSelection from './useCalendarSelection.ts'
import {
    commitCalendarSelection,
    shouldCloseCalendarAfterSelection,
} from '../../../lib/Calendar/CalendarCommit.ts'
import { formatCalendarValue } from '../../../lib/Calendar/FormatFunctions.ts'
import { serializeCalendarValue } from '../../../lib/Calendar/CalendarValue.ts'
import { calendarValueHasTimeWithinBounds } from '../../../lib/Calendar/CalendarTime.ts'
import { calendarValueWithinDateTimeBounds } from '../../../lib/Calendar/CalendarDateTime.ts'
import { calendarValueWithinDateBounds } from '../../../lib/Calendar/CalendarDay.ts'
import {
    mergeAriaIds,
    resolveCalendarFieldError,
} from '../../../lib/Calendar/CalendarField.ts'
import {
    extractRadius,
    hasWidthUtilityClass,
} from '../../../lib/Calendar/design.ts'
import { hasCalendarValue } from '../../../lib/Calendar/CalendarValue.ts'
import { normalizeValue, parseToDate } from '../../../lib/Calendar/date.ts'
import { useCalendarDefaults } from './useCalendarDefaults.ts'
import { composeRefs } from './composeRefs.ts'

const calendarPopoverMinWidth = 340

export default function useCustomCalendarLogic({
    controlSize: providedControlSize,
    classNames: providedClassNames,
    portalContainer: providedPortalContainer,
    portalClassName: providedPortalClassName,
    portalZIndex: providedPortalZIndex,
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
    minDateTime: rawMinDateTime,
    maxDateTime: rawMaxDateTime,
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
}: CalendarInternalProps): CustomCalendarLogicResult {
    const defaults = useCalendarDefaults()
    const controlSize = providedControlSize ?? defaults.controlSize
    const classNames = { ...defaults.classNames, ...providedClassNames }
    const portalContainer =
        providedPortalContainer === undefined
            ? defaults.portalContainer
            : providedPortalContainer
    const portalClassName = providedPortalClassName ?? defaults.portalClassName
    const portalZIndex = providedPortalZIndex ?? defaults.portalZIndex
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
    const displayValueId = `${fieldId}-value`
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

    const minDateTime = useMemo(
        () => parseToDate(rawMinDateTime) || undefined,
        [rawMinDateTime],
    )
    const maxDateTime = useMemo(
        () => parseToDate(rawMaxDateTime) || undefined,
        [rawMaxDateTime],
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
        zIndex: portalZIndex,
    }

    const inputClasses = [
        'relative flex items-center px-4 gap-3 transition-colors cursor-pointer group outline-none focus-visible:ring-2 focus-visible:ring-rentner-accent/50',
        classNames.control ??
            [
                'shadow-sm',
                hasError
                    ? 'border-rentner-danger focus:ring-rentner-danger'
                    : cd.borderColor,
                cd.inputBackground,
                hasError ? '' : cd.primaryColorFocusWithin,
                hasError ? '' : cd.primaryFocusBorder,
                hasError ? '' : cd.primaryRing,
            ].join(' '),
        disabled ? 'cursor-not-allowed opacity-60' : '',
        readOnly ? 'cursor-default' : '',
        controlSize
            ? {
                  sm: 'h-rentner-control-sm',
                  md: 'h-rentner-control-md',
                  lg: 'h-rentner-control-lg',
              }[controlSize]
            : !className.includes('h-')
              ? 'h-[2.75rem]'
              : '',
        !classNames.control && !className.includes('rounded')
            ? 'rounded-rentner-control'
            : '',
        className,
    ]
        .filter(Boolean)
        .join(' ')

    const popoverClasses = [
        'z-[var(--rentner-overlay-z,9000)] p-4 overflow-y-auto',
        classNames.portal ??
            `shadow-xl ${cd.surfaceBackground} ${cd.borderColor}`,
        portalClassName,
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

        if (
            !calendarValueWithinDateTimeBounds(newVal, minDateTime, maxDateTime)
        )
            return
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
        minDateTime,
        maxDateTime,
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

        if (
            !calendarValueWithinDateTimeBounds(
                tempValue,
                minDateTime,
                maxDateTime,
            )
        )
            return
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
    const triggerLabelledBy = labelledBy
        ? mergeAriaIds(labelledBy, displayValueId)
        : undefined
    const triggerLabel = triggerLabelledBy
        ? undefined
        : `${ariaLabel ?? (isOpen ? messages.closeCalendar : messages.openCalendar)}: ${displayValue || resolvedPlaceholder}`
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
                classNames,
                portalContainer,
                ariaLabel: triggerLabel,
                ariaLabelledBy: triggerLabelledBy,
                ariaDescribedBy: describedBy,
                ariaProps,
                cd,
                description,
                descriptionId,
                dialogId,
                disabled,
                displayValue,
                displayValueId,
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
                classNames,
                controlSize,
                portalContainer,
                portalClassName,
                portalZIndex,
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
                minDateTime,
                maxDateTime,
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
