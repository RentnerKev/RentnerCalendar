/* oxlint-disable jsx-a11y/role-supports-aria-props -- Preserve the public error-trigger ARIA contract; the native validation input is hidden and cannot announce these errors. */
import { createPortal } from 'react-dom'
import { AlertCircle, CalendarDays, X } from 'lucide-react'
import { CustomTooltip } from '@rentnerkev/tooltips'

import type { CalendarFieldProps } from '../Types/CalendarField.types.ts'

export default function CalendarField({
    classNames,
    portalContainer,
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
    displayValueId,
    formValue,
    error,
    errorId,
    fieldId,
    handleClear,
    handleFieldBlur,
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
    const showClearButton = isDeletable && displayValue.length > 0
    return (
        <div className={classNames?.root ?? 'w-full'} onBlur={handleFieldBlur}>
            {label != null && (
                <div
                    id={labelId}
                    className={classNames?.label ?? 'mb-1 text-sm font-medium'}
                >
                    {label}
                </div>
            )}
            <div className={showClearButton ? 'relative flex' : 'relative'}>
                <button
                    type="button"
                    id={fieldId}
                    ref={setTriggerRef}
                    className={`${inputClasses} ${showClearButton ? 'flex-none pr-12' : ''}`}
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
                    aria-label={ariaLabel}
                    aria-labelledby={ariaLabelledBy}
                    aria-describedby={ariaDescribedBy}
                    aria-disabled={
                        disabled ||
                        readOnly ||
                        ariaProps['aria-disabled'] ||
                        undefined
                    }
                    aria-readonly={undefined}
                    aria-expanded={isOpen}
                    aria-controls={
                        ariaProps['aria-controls'] ??
                        (isOpen ? dialogId : undefined)
                    }
                    aria-haspopup={ariaProps['aria-haspopup'] ?? 'dialog'}
                >
                    {(hasError || icon !== false) && (
                        <span
                            className={
                                classNames?.leading ??
                                'inline-flex items-center'
                            }
                        >
                            {hasError ? (
                                <CustomTooltip
                                    content={error || ''}
                                    side="bottom"
                                >
                                    <AlertCircle className="h-5 w-5 text-rentner-danger" />
                                </CustomTooltip>
                            ) : (
                                icon !== false &&
                                (icon || (
                                    <CalendarDays
                                        className={`w-5 h-5 ${cd.textMuted}`}
                                    />
                                ))
                            )}
                        </span>
                    )}
                    <span
                        id={displayValueId}
                        className={`flex-1 truncate ${classNames?.control ? '' : displayValue ? cd.textColor : cd.textMuted}`}
                    >
                        {displayValue || resolvedPlaceholder}
                    </span>
                </button>
                {showClearButton && (
                    <span className="relative w-0 shrink-0 self-stretch">
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label={messages.clear}
                            disabled={disabled || readOnly}
                            style={{ borderRadius: resolvedRadius }}
                            className={`group/delete absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 ${classNames?.trailing ?? 'bg-rentner-danger/50 hover:bg-rentner-danger/40 focus-visible:ring-rentner-accent'}`}
                        >
                            <X aria-hidden="true" className="h-4 w-4" />
                        </button>
                    </span>
                )}
            </div>
            {isOpen &&
                typeof document !== 'undefined' &&
                createPortal(popoverContent, portalContainer ?? document.body)}
            <input
                ref={validationInputRef}
                name={name}
                value={formValue}
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
                    className={
                        classNames?.description ??
                        `mt-1 text-xs ${cd.textMuted}`
                    }
                >
                    {description}
                </div>
            )}
            {hasError && error && (
                <span
                    id={errorId}
                    className={classNames?.error ?? 'sr-only'}
                    aria-live="polite"
                >
                    {error}
                </span>
            )}
        </div>
    )
}
