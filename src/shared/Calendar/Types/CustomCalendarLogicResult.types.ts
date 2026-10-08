import type { AriaAttributes } from 'react'
import type { CalendarCustomDesign } from './Calendar.types.ts'
import type {
    CSSProperties,
    FocusEvent,
    InvalidEvent,
    MouseEvent,
    RefCallback,
} from 'react'

export type CustomCalendarLogicResult = {
    state: {
        field: {
            ariaLabel: string | undefined
            ariaLabelledBy: string | undefined
            ariaDescribedBy: string | undefined
            ariaProps: Omit<
                AriaAttributes,
                'aria-label' | 'aria-labelledby' | 'aria-describedby'
            >
            cd: Required<CalendarCustomDesign>
            description: import('react').ReactNode
            descriptionId: string
            dialogId: string
            disabled: boolean
            displayValue: string
            formValue: string
            error: string | null
            errorId: string
            fieldId: string
            hasError: boolean
            icon: import('react').ReactNode
            inputClasses: string
            inputStyle: CSSProperties
            isDeletable: boolean
            isOpen: boolean
            label: import('react').ReactNode
            labelId: string
            messages: import('../../../lib/Calendar/Types/Messages.types.ts').CalendarMessages
            name: string | undefined
            readOnly: boolean
            resolvedPlaceholder: string
            resolvedRadius: string
            validationRequired: boolean
        }
        popover: {
            backdrop: boolean
            dialogId: string
            className: string
            style: CSSProperties
            labelledBy: string | undefined
            describedBy: string | undefined
            dialogLabel: string
            switchMode: boolean
            isRangeMode: boolean
            disabled: boolean
            readOnly: boolean
            messages: import('../../../lib/Calendar/Types/Messages.types.ts').CalendarMessages
            currentDate: Date
            fastEdit: boolean
            customDesign: Required<CalendarCustomDesign>
            selectedDate: CalendarValue
            minDate: Date | undefined
            maxDate: Date | undefined
            weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7
            visibleDays: number
            showHolidays: boolean
            locale: import('../../../lib/Calendar/Types/Messages.types.ts').CalendarLocale
            enableTime: boolean
            minTime: string | undefined
            maxTime: string | undefined
            button: boolean
        }
    }
    handler: {
        closeCalendar: () => void
        handleClear: (e: MouseEvent) => void
        handleFieldBlur: (event: FocusEvent<HTMLDivElement>) => void
        handleInvalid: (event: InvalidEvent<HTMLInputElement>) => void
        toggleCalendar: () => void
        handleApply: () => void
        handlePrevMonth: () => void
        handleNextMonth: () => void
        handleViewDateChange: (date: Date) => void
        handleGetDaysInMonth: () => {
            date: Date
            isCurrentMonth: boolean
        }[]
        handleDateSelect: (date: Date) => void
        handleTimeChange: (newValue: CalendarValue) => void
    }
    setter: {
        setIsRangeMode: import('react').Dispatch<
            import('react').SetStateAction<boolean>
        >
    }
    refs: {
        setTriggerRef: RefCallback<HTMLButtonElement>
        popoverRef: import('react').RefObject<HTMLDivElement | null>
        validationInputRef: import('react').RefObject<HTMLInputElement | null>
    }
}
import type { CalendarValue } from './Calendar.types.ts'
