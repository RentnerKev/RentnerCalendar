import * as SelectPrimitive from '@radix-ui/react-select'
import { CustomTooltip } from '@rentnerkev/tooltips'
import { AlertCircle, Check, ChevronDown } from 'lucide-react'
import type { CustomSelectProps } from '../../Types/InternalSelect.types.js'
import useInternalSelectLogic from '../../Hooks/useInternalSelectLogic.js'

export function CustomSelect(props: CustomSelectProps) {
    const {
        portalOwnerId,
        name,
        value,
        required = false,
        icon,
        placeholder,
        className,
        fallbackOption,
        multiple = false,
        disabled = false,
        readOnly = false,
        'aria-label': ariaLabel,
    } = props
    const { state, handler, refs } = useInternalSelectLogic(props)
    const {
        triggerId,
        messages,
        isInteractionDisabled,
        open,
        searchValue,
        selectedValues,
        error,
        hasError,
        hasLeftIcon,
        filteredOptions,
        selectedOptions,
    } = state
    const { handleValueChange, handleInvalid } = handler
    const { searchInputRef, validationInputRef } = refs

    return (
        <SelectPrimitive.Root
            disabled={isInteractionDisabled}
            open={open}
            onOpenChange={handler.handleOpenChange}
            value={multiple ? '' : value}
            onValueChange={handleValueChange}
        >
            <div className="group relative">
                <input
                    ref={validationInputRef}
                    name={name}
                    value={value}
                    onChange={() => undefined}
                    onInvalid={handleInvalid}
                    required={required && !disabled}
                    disabled={disabled}
                    tabIndex={-1}
                    aria-hidden="true"
                    className="pointer-events-none absolute left-0 top-1/2 h-px w-px -translate-y-1/2 opacity-0"
                />
                {hasLeftIcon && (
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10 text-gray-500">
                        {hasError ? (
                            <CustomTooltip content={error || ''} side="bottom">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </CustomTooltip>
                        ) : (
                            <span className="pointer-events-none flex items-center transition-colors group-focus-within:text-primary [&>svg]:h-4 [&>svg]:w-4">
                                {icon}
                            </span>
                        )}
                    </div>
                )}
                <SelectPrimitive.Trigger
                    id={triggerId}
                    aria-label={ariaLabel}
                    disabled={isInteractionDisabled}
                    aria-readonly={readOnly || undefined}
                    aria-invalid={hasError}
                    className={`bg-input-dark border text-[11px] text-gray-300 rounded-lg ${
                        hasLeftIcon ? 'pl-8' : 'pl-3'
                    } pr-8 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 w-full uppercase font-bold tracking-wider cursor-pointer flex items-center justify-between transition-colors min-w-45 ${
                        hasError
                            ? 'border-red-500 focus:ring-2 focus:ring-red-500/50 data-[state=open]:border-red-500'
                            : 'border-border-dark focus:border-primary data-[state=open]:border-primary'
                    } ${className || ''}`}
                >
                    <span className="min-w-0 flex-1 text-left">
                        {selectedOptions.length > 0 ? (
                            <span className="flex min-w-0 flex-col gap-0.5">
                                <span className="truncate leading-4">
                                    {selectedOptions
                                        .map((o) => o.label)
                                        .join(', ')}
                                </span>
                                {selectedOptions.length === 1 &&
                                    selectedOptions[0].subOption && (
                                        <span className="truncate text-[10px] font-semibold leading-3 tracking-normal text-gray-500 normal-case">
                                            {selectedOptions[0].subOption}
                                        </span>
                                    )}
                            </span>
                        ) : (
                            <SelectPrimitive.Value placeholder={placeholder} />
                        )}
                    </span>
                    <SelectPrimitive.Icon asChild>
                        <ChevronDown className="h-4 w-4 opacity-50 absolute right-2.5 top-1/2 -translate-y-1/2" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
            </div>

            <SelectPrimitive.Portal>
                <SelectPrimitive.Content
                    data-calendar-dialog-portal={portalOwnerId}
                    data-calendar-portal-opener={
                        portalOwnerId ? triggerId : undefined
                    }
                    position="popper"
                    sideOffset={4}
                    onFocusCapture={handler.handleContentFocusCapture}
                    onKeyDownCapture={handler.handleContentKeyDownCapture}
                    className="z-9998 w-(--radix-select-trigger-width) min-w-45 overflow-hidden rounded-lg border border-border-dark bg-surface-dark shadow-xl motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
                >
                    <div className="border-b border-border-dark p-1">
                        <input
                            ref={searchInputRef}
                            aria-label={messages.searchOptions}
                            value={searchValue}
                            disabled={isInteractionDisabled}
                            onChange={handler.handleSearchChange}
                            onPointerDownCapture={
                                handler.handleSearchPointerDownCapture
                            }
                            onKeyDownCapture={
                                handler.handleSearchKeyDownCapture
                            }
                            onKeyDown={handler.handleSearchKeyDown}
                            placeholder={messages.searchPlaceholder}
                            className="h-8 w-full rounded-md border border-border-dark bg-input-dark px-2 text-[11px] font-bold uppercase tracking-wider text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 placeholder:text-gray-500 focus:border-primary"
                        />
                    </div>
                    <div className="rentnerselect-scrollbar max-h-[min(var(--radix-select-content-available-height),16rem)] overflow-y-scroll scrollbar-gutter-stable">
                        <SelectPrimitive.Viewport className="p-1">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <SelectPrimitive.Item
                                        key={option.value}
                                        value={option.value}
                                        onPointerDown={
                                            handler.handleOptionPointerDown
                                        }
                                        onKeyDown={handler.handleOptionKeyDown}
                                        className="relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-[11px] font-bold uppercase tracking-wider text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus:bg-primary/20 focus:text-primary transition-colors data-disabled:opacity-50"
                                    >
                                        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                            {multiple ? (
                                                selectedValues.includes(
                                                    option.value,
                                                ) && (
                                                    <Check className="h-4 w-4" />
                                                )
                                            ) : (
                                                <SelectPrimitive.ItemIndicator>
                                                    <Check className="h-4 w-4" />
                                                </SelectPrimitive.ItemIndicator>
                                            )}
                                        </span>
                                        <SelectPrimitive.ItemText>
                                            <span className="flex min-w-0 flex-col gap-0.5">
                                                <span className="truncate leading-4">
                                                    {option.label}
                                                </span>
                                                {option.subOption && (
                                                    <span className="truncate text-[10px] font-semibold leading-3 tracking-normal text-gray-500 normal-case">
                                                        {option.subOption}
                                                    </span>
                                                )}
                                            </span>
                                        </SelectPrimitive.ItemText>
                                    </SelectPrimitive.Item>
                                ))
                            ) : (
                                <div className="relative flex w-full select-none items-center rounded-md py-2 pl-8 pr-2 text-[11px] font-bold uppercase tracking-wider text-gray-500 opacity-60 outline-none italic cursor-not-allowed">
                                    {searchValue.trim()
                                        ? messages.noResults
                                        : fallbackOption || messages.noOptions}
                                </div>
                            )}
                        </SelectPrimitive.Viewport>
                    </div>
                </SelectPrimitive.Content>
            </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
    )
}
