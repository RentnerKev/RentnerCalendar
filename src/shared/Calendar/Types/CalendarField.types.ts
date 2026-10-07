import type {
    AriaAttributes,
    CSSProperties,
    FocusEvent,
    MouseEvent,
    ReactNode,
    RefObject,
    InvalidEvent,
} from 'react'
import type { CalendarMessages } from '../../../lib/Calendar/messages.js'
import type { CalendarCustomDesign } from './Calendar.types.js'

export interface CalendarFieldProps {
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
    formValue: string
    error: string | null
    errorId: string
    fieldId: string
    handleClear: (event: MouseEvent<HTMLButtonElement>) => void
    handleFieldBlur: (event: FocusEvent<HTMLDivElement>) => void
    handleInvalid: (event: InvalidEvent<HTMLInputElement>) => void
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
