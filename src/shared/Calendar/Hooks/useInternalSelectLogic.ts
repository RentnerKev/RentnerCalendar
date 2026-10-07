import type { InternalSelectLogicResult } from '../Types/InternalSelectLogicResult.types.js'
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import type {
    InvalidEvent,
    FocusEvent,
    KeyboardEvent,
    ChangeEvent,
    PointerEvent,
} from 'react'
import type { CustomSelectProps } from '../Types/InternalSelect.types.js'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.js'

function handleSearchPointerDownCapture(event: PointerEvent<HTMLInputElement>) {
    event.stopPropagation()
}
function handleSearchKeyDownCapture(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Escape') event.stopPropagation()
}
function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Escape' && event.key !== 'Tab') event.stopPropagation()
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
    const shouldKeepOpen = useRef(false)

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
        }
    }

    function handleInvalid(event: InvalidEvent<HTMLInputElement>) {
        event.preventDefault()
        setIsTouched(true)
    }

    const focusSearchInput = useCallback(() => {
        requestAnimationFrame(() => searchInputRef.current?.focus())
        window.setTimeout(() => searchInputRef.current?.focus(), 0)
    }, [])

    useEffect(() => {
        if (open) {
            focusSearchInput()
        }
    }, [open, focusSearchInput])

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

    function handleOpenChange(nextOpen: boolean) {
        if (multiple && !nextOpen && shouldKeepOpen.current) {
            shouldKeepOpen.current = false
            return
        }
        setOpen(nextOpen)
        if (nextOpen) focusSearchInput()
        else setSearchValue('')
    }
    function handleContentFocusCapture(event: FocusEvent<HTMLDivElement>) {
        if (event.target !== searchInputRef.current && searchInputRef.current) {
            event.stopPropagation()
            focusSearchInput()
        }
    }
    function handleContentKeyDownCapture(event: KeyboardEvent<HTMLDivElement>) {
        if (
            event.target === searchInputRef.current ||
            event.ctrlKey ||
            event.altKey ||
            event.metaKey ||
            event.key.length !== 1
        )
            return
        event.preventDefault()
        event.stopPropagation()
        setSearchValue((current) => `${current}${event.key}`)
        focusSearchInput()
    }
    function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
        setSearchValue(event.target.value)
    }
    function handleOptionPointerDown() {
        if (multiple) shouldKeepOpen.current = true
    }
    function handleOptionKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (multiple && (event.key === 'Enter' || event.key === ' '))
            shouldKeepOpen.current = true
    }
    return {
        state: {
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
            handleValueChange,
            handleInvalid,
            handleOpenChange,
            handleContentFocusCapture,
            handleContentKeyDownCapture,
            handleSearchChange,
            handleSearchPointerDownCapture,
            handleSearchKeyDownCapture,
            handleSearchKeyDown,
            handleOptionPointerDown,
            handleOptionKeyDown,
        },
        refs: { searchInputRef, validationInputRef },
    }
}
