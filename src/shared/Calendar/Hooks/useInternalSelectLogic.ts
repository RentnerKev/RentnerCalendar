import type { InternalSelectLogicResult } from '../Types/InternalSelectLogicResult.types.ts'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { InvalidEvent, ChangeEvent, PointerEvent } from 'react'
import type { CustomSelectProps } from '../Types/InternalSelect.types.ts'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.ts'
import { useInternalSelectOverlay } from './useInternalSelectOverlay.ts'

function handleSearchPointerDownCapture(event: PointerEvent<HTMLInputElement>) {
    event.stopPropagation()
}

export default function useInternalSelectLogic({
    id,
    value,
    onValueChange,
    options,
    required = false,
    icon,
    multiple = false,
    minSelection,
    maxSelection,
    messages: providedMessages,
    disabled = false,
    readOnly = false,
    portalContainer,
}: CustomSelectProps): InternalSelectLogicResult {
    const generatedId = useId()
    const triggerId = id ?? generatedId
    const messages = providedMessages ?? resolveCalendarMessages()
    const isInteractionDisabled = disabled || readOnly
    const [open, setOpen] = useState(false)
    const [searchValue, setSearchValue] = useState('')
    const [isTouched, setIsTouched] = useState(false)
    const searchInputRef = useRef<HTMLInputElement>(null)
    const validationInputRef = useRef<HTMLInputElement>(null)
    const overlay = useInternalSelectOverlay({
        open: open && !isInteractionDisabled,
        triggerId,
        portalContainer,
        searchInputRef,
        onOpenChange: handleOpenChange,
        onSelect: handleValueChange,
        onSearch: setSearchValue,
    })
    if (isInteractionDisabled && open) {
        setOpen(false)
        setSearchValue('')
    }

    const selectedValues = useMemo(() => {
        if (!value) return []
        return multiple ? value.split(',') : [value]
    }, [value, multiple])

    const error = useMemo(() => {
        if (required && selectedValues.length === 0) {
            return messages.required
        }
        if (
            multiple &&
            minSelection !== undefined &&
            selectedValues.length < minSelection
        ) {
            return messages.minSelection(minSelection)
        }
        if (
            multiple &&
            maxSelection !== undefined &&
            selectedValues.length > maxSelection
        ) {
            return messages.maxSelection(maxSelection)
        }
        return null
    }, [
        messages,
        required,
        multiple,
        minSelection,
        maxSelection,
        selectedValues,
    ])

    const hasError = isTouched && error !== null
    const hasLeftIcon = Boolean(icon || hasError)

    const filteredOptions = useMemo(() => {
        const normalizedSearch = searchValue.trim().toLowerCase()

        if (!normalizedSearch) {
            return options
        }

        return options.filter((option) => {
            const label = option.label.toLowerCase()
            const optionValue = option.value.toLowerCase()
            const subOption = option.subOption?.toLowerCase() || ''

            return (
                label.includes(normalizedSearch) ||
                optionValue.includes(normalizedSearch) ||
                subOption.includes(normalizedSearch)
            )
        })
    }, [options, searchValue])

    const selectedOptions = useMemo(() => {
        return options.filter((option) => selectedValues.includes(option.value))
    }, [options, selectedValues])

    function handleValueChange(nextValue: string) {
        if (isInteractionDisabled) {
            return
        }

        if (multiple) {
            let nextArray = selectedValues.includes(nextValue)
                ? selectedValues.filter((v) => v !== nextValue)
                : [...selectedValues, nextValue]

            if (
                maxSelection !== undefined &&
                nextArray.length > maxSelection &&
                !selectedValues.includes(nextValue)
            ) {
                return
            }

            onValueChange(nextArray.join(','))
        } else {
            setSearchValue('')
            onValueChange(nextValue)
            setOpen(false)
            overlay.refs.triggerRef.current?.focus({ preventScroll: true })
        }
    }

    function handleInvalid(event: InvalidEvent<HTMLInputElement>) {
        event.preventDefault()
        setIsTouched(true)
    }

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
        function handleReset() {
            setOpen(false)
            setSearchValue('')
            setIsTouched(false)
        }
        form.addEventListener('reset', handleReset)

        return () => {
            form.removeEventListener('submit', handleFormSubmit)
            form.removeEventListener('reset', handleReset)
        }
    }, [])

    function handleOpenChange(nextOpen: boolean) {
        if (isInteractionDisabled && nextOpen) return
        setOpen(nextOpen)
        if (!nextOpen) setSearchValue('')
    }
    function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value)
    }
    return {
        state: {
            defaultPortalContainer: overlay.state.defaultPortalContainer,
            popupStyle: overlay.state.popupStyle,
            listboxId: `${triggerId}-options`,
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
        },
        handler: {
            handleTriggerClick: overlay.handler.handleTriggerClick,
            handleTriggerKeyDown: overlay.handler.handleTriggerKeyDown,
            handleNativeContentKeyDown: overlay.handler.handleContentKeyDown,
            handleNativeOptionKeyDown: overlay.handler.handleOptionKeyDown,
            handleValueChange,
            handleInvalid,
            handleSearchChange,
            handleSearchPointerDownCapture,
        },
        refs: { searchInputRef, validationInputRef, ...overlay.refs },
    }
}
