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
            ariaProps: {
                'aria-activedescendant'?: string | undefined
                'aria-atomic'?: ('false' | 'true' | boolean) | undefined
                'aria-autocomplete'?:
                    | 'none'
                    | 'inline'
                    | 'list'
                    | 'both'
                    | undefined
                'aria-braillelabel'?: string | undefined
                'aria-brailleroledescription'?: string | undefined
                'aria-busy'?: ('false' | 'true' | boolean) | undefined
                'aria-checked'?:
                    | boolean
                    | 'false'
                    | 'mixed'
                    | 'true'
                    | undefined
                'aria-colcount'?: number | undefined
                'aria-colindex'?: number | undefined
                'aria-colindextext'?: string | undefined
                'aria-colspan'?: number | undefined
                'aria-controls'?: string | undefined
                'aria-current'?:
                    | boolean
                    | 'false'
                    | 'true'
                    | 'page'
                    | 'step'
                    | 'location'
                    | 'date'
                    | 'time'
                    | undefined
                'aria-description'?: string | undefined
                'aria-details'?: string | undefined
                'aria-disabled'?: ('false' | 'true' | boolean) | undefined
                'aria-dropeffect'?:
                    | 'none'
                    | 'copy'
                    | 'execute'
                    | 'link'
                    | 'move'
                    | 'popup'
                    | undefined
                'aria-errormessage'?: string | undefined
                'aria-expanded'?: ('false' | 'true' | boolean) | undefined
                'aria-flowto'?: string | undefined
                'aria-grabbed'?: ('false' | 'true' | boolean) | undefined
                'aria-haspopup'?:
                    | boolean
                    | 'false'
                    | 'true'
                    | 'menu'
                    | 'listbox'
                    | 'tree'
                    | 'grid'
                    | 'dialog'
                    | undefined
                'aria-hidden'?: ('false' | 'true' | boolean) | undefined
                'aria-invalid'?:
                    | boolean
                    | 'false'
                    | 'true'
                    | 'grammar'
                    | 'spelling'
                    | undefined
                'aria-keyshortcuts'?: string | undefined
                'aria-level'?: number | undefined
                'aria-live'?: 'off' | 'assertive' | 'polite' | undefined
                'aria-modal'?: ('false' | 'true' | boolean) | undefined
                'aria-multiline'?: ('false' | 'true' | boolean) | undefined
                'aria-multiselectable'?:
                    | ('false' | 'true' | boolean)
                    | undefined
                'aria-orientation'?: 'horizontal' | 'vertical' | undefined
                'aria-owns'?: string | undefined
                'aria-placeholder'?: string | undefined
                'aria-posinset'?: number | undefined
                'aria-pressed'?:
                    | boolean
                    | 'false'
                    | 'mixed'
                    | 'true'
                    | undefined
                'aria-readonly'?: ('false' | 'true' | boolean) | undefined
                'aria-relevant'?:
                    | 'additions'
                    | 'additions removals'
                    | 'additions text'
                    | 'all'
                    | 'removals'
                    | 'removals additions'
                    | 'removals text'
                    | 'text'
                    | 'text additions'
                    | 'text removals'
                    | undefined
                'aria-required'?: ('false' | 'true' | boolean) | undefined
                'aria-roledescription'?: string | undefined
                'aria-rowcount'?: number | undefined
                'aria-rowindex'?: number | undefined
                'aria-rowindextext'?: string | undefined
                'aria-rowspan'?: number | undefined
                'aria-selected'?: ('false' | 'true' | boolean) | undefined
                'aria-setsize'?: number | undefined
                'aria-sort'?:
                    | 'none'
                    | 'ascending'
                    | 'descending'
                    | 'other'
                    | undefined
                'aria-valuemax'?: number | undefined
                'aria-valuemin'?: number | undefined
                'aria-valuenow'?: number | undefined
                'aria-valuetext'?: string | undefined
            }
            cd: {
                primaryColor: string
                primaryColorFocusWithin: string
                primaryBg: string
                primaryHover: string
                primaryBorder: string
                primaryFocusBorder: string
                primaryRing: string
                primaryBgSubtle: string
                surfaceBackground: string
                inputBackground: string
                borderColor: string
                borderTransparent: string
                textColor: string
                textMuted: string
                textMutedDark: string
                textDisabled: string
                textDay: string
                textBackground: string
                hoverBackground: string
                hoverText: string
                hoverTextMuted: string
            }
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
            messages: import('../../../lib/Calendar/messages.js').CalendarMessages
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
            messages: import('../../../lib/Calendar/messages.js').CalendarMessages
            currentDate: Date
            fastEdit: boolean
            customDesign: {
                primaryColor: string
                primaryColorFocusWithin: string
                primaryBg: string
                primaryHover: string
                primaryBorder: string
                primaryFocusBorder: string
                primaryRing: string
                primaryBgSubtle: string
                surfaceBackground: string
                inputBackground: string
                borderColor: string
                borderTransparent: string
                textColor: string
                textMuted: string
                textMutedDark: string
                textDisabled: string
                textDay: string
                textBackground: string
                hoverBackground: string
                hoverText: string
                hoverTextMuted: string
            }
            selectedDate: CalendarValue
            minDate: Date | undefined
            maxDate: Date | undefined
            weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7
            visibleDays: number
            showHolidays: boolean
            locale: import('../../../lib/Calendar/messages.js').CalendarLocale
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
import type { CalendarValue } from './Calendar.types.js'
