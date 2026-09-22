import { createPortal } from 'react-dom'
import type {
    AriaAttributes,
    CSSProperties,
    MouseEvent,
    ReactNode,
    RefObject,
} from 'react'
import { AlertCircle, CalendarDays, X } from 'lucide-react'
import { CustomTooltip } from '@rentnerkev/tooltips'
import type { CalendarMessages } from '../messages.js'
import type { CalendarCustomDesign } from '../types.js'

interface CalendarFieldProps {
    ariaLabel?: string
    ariaLabelledBy?: string
    ariaDescribedBy?: string
    ariaProps: AriaAttributes
    cd: Required<CalendarCustomDesign>
    dialogId: string
    description?: ReactNode
    descriptionId: string
    disabled: boolean
    displayValue: string
    error: string | null
    errorId: string
    fieldId: string
    handleClear: (event: MouseEvent<HTMLButtonElement>) => void
    handleInvalid: (event: React.InvalidEvent<HTMLInputElement>) => void
    hasError: boolean
    icon?: ReactNode | boolean
    inputClasses: string
    inputStyle: CSSProperties
    isDeletable: boolean
    isOpen: boolean
    label?: ReactNode
    labelId: string
    messages: CalendarMessages
    name?: string
    popoverContent: ReactNode
    readOnly: boolean
    resolvedPlaceholder: string
    resolvedRadius: string
    setTriggerRef: (element: HTMLButtonElement | null) => void
    toggleCalendar: () => void
    validationInputRef: RefObject<HTMLInputElement | null>
    validationRequired: boolean
}

export default function CalendarField({
    ariaLabel,
    ariaLabelledBy,
    ariaDescribedBy,
    ariaProps,
    cd,
    dialogId,
    description,
    descriptionId,
    disabled,
    displayValue,
    error,
    errorId,
    fieldId,
    handleClear,
    handleInvalid,
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
    popoverContent,
    readOnly,
    resolvedPlaceholder,
    resolvedRadius,
    setTriggerRef,
    toggleCalendar,
    validationInputRef,
    validationRequired,
}: CalendarFieldProps) {
    return (
        <div className="w-full">
            {label != null && (
                <div id={labelId} className="mb-1 text-sm font-medium">
                    {label}
                </div>
            )}
            <div className="relative">
                <button
                    type="button"
                    id={fieldId}
                    ref={setTriggerRef}
                    className={`${inputClasses} ${isDeletable && displayValue ? 'pr-12' : ''}`}
                    style={inputStyle}
                    onClick={toggleCalendar}
                    tabIndex={disabled ? -1 : 0}
                    {...ariaProps}
                    aria-invalid={
                        hasError || ariaProps['aria-invalid'] || undefined
                    }
                    aria-errormessage={
                        hasError ? errorId : ariaProps['aria-errormessage']
                    }
                    aria-label={
                        ariaLabel ??
                        (ariaLabelledBy
                            ? undefined
                            : isOpen
                              ? messages.closeCalendar
                              : messages.openCalendar)
                    }
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={ariaDescribedBy}
                    aria-disabled={
                        disabled || ariaProps['aria-disabled'] || undefined
                    }
                    aria-readonly={
                        readOnly || ariaProps['aria-readonly'] || undefined
                    }
                    aria-expanded={isOpen}
                    aria-controls={
                        ariaProps['aria-controls'] ??
                        (isOpen ? dialogId : undefined)
                    }
                    aria-haspopup={ariaProps['aria-haspopup'] ?? 'dialog'}
                >
                    {hasError ? (
                        <CustomTooltip content={error || ''} side="bottom">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                        </CustomTooltip>
                    ) : (
                        icon !== false &&
                        (icon || (
                            <CalendarDays
                                className={`w-5 h-5 ${cd.textMuted}`}
                            />
                        ))
                    )}
                    <span
                        className={`flex-1 truncate ${displayValue ? cd.textColor : cd.textMuted}`}
                    >
                        {displayValue || resolvedPlaceholder}
                    </span>
                </button>
                {isDeletable && displayValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        aria-label={messages.clear}
                        disabled={disabled || readOnly}
                        style={{ borderRadius: resolvedRadius }}
                        className="group/delete absolute right-2 top-1/2 -translate-y-1/2 bg-red-500/50 p-1 transition-colors hover:bg-red-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                    >
                        <X aria-hidden="true" className="h-4 w-4" />
                    </button>
                )}
            </div>
            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(popoverContent, document.body)}
            <input
                ref={validationInputRef}
                name={name}
                value={displayValue}
                onChange={() => undefined}
                onInvalid={handleInvalid}
                required={validationRequired}
                disabled={disabled}
                readOnly={readOnly}
                tabIndex={-1}
                aria-hidden="true"
                className="pointer-events-none absolute h-px w-px opacity-0"
            />
            {description != null && (
                <div
                    id={descriptionId}
                    className="mt-1 text-xs text-muted-foreground"
                >
                    {description}
                </div>
            )}
            {hasError && error && (
                <span id={errorId} className="sr-only" aria-live="polite">
                    {error}
                </span>
            )}
        </div>
    )
}
