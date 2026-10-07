export type SingleCalendarLogicResult = {
    state: {
        props: {
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
            'aria-checked'?: boolean | 'false' | 'mixed' | 'true' | undefined
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
            'aria-describedby'?: string | undefined
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
            'aria-label'?: string | undefined
            'aria-labelledby'?: string | undefined
            'aria-level'?: number | undefined
            'aria-live'?: 'off' | 'assertive' | 'polite' | undefined
            'aria-modal'?: ('false' | 'true' | boolean) | undefined
            'aria-multiline'?: ('false' | 'true' | boolean) | undefined
            'aria-multiselectable'?: ('false' | 'true' | boolean) | undefined
            'aria-orientation'?: 'horizontal' | 'vertical' | undefined
            'aria-owns'?: string | undefined
            'aria-placeholder'?: string | undefined
            'aria-posinset'?: number | undefined
            'aria-pressed'?: boolean | 'false' | 'mixed' | 'true' | undefined
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
            id?: string
            name?: string
            formValueFormat?: import('../../../types.js').CalendarFormValueFormat
            onBlur?: import('react').FocusEventHandler<HTMLDivElement>
            label?: import('react').ReactNode
            description?: import('react').ReactNode
            error?: string | null
            required?: boolean
            disabled?: boolean
            readOnly?: boolean
            triggerRef?: import('react').Ref<HTMLButtonElement>
            className?: string
            enableTime?: boolean
            isDeletable?: boolean
            icon?: import('react').ReactNode | boolean
            backdrop?: boolean
            button?: boolean
            placeholder?: string
            customDesign?: import('../../../types.js').CalendarCustomDesign
            closeOnSelect?: boolean
            minDate?: import('../../../types.js').CalendarDateInput
            maxDate?: import('../../../types.js').CalendarDateInput
            minTime?: string
            maxTime?: string
            fastEdit?: boolean
            weekStartsOn?: 1 | 2 | 3 | 4 | 5 | 6 | 7
            visibleDays?: number
            showHolidays?: boolean
            locale?: import('../../../lib/Calendar/messages.js').CalendarLocale
            messages?: Partial<
                import('../../../lib/Calendar/messages.js').CalendarMessages
            >
            value?: import('../../../types.js').SingleCalendarInputValue
        }
    }
    handler: {
        onChange: ((value: CalendarValue) => void) | undefined
        getFormValue: ((value: CalendarValue) => string) | undefined
    }
}
import type { CalendarValue } from './Calendar.types.js'
