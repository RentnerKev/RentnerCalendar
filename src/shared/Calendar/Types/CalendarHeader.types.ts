import type { CalendarHeaderProps } from './Calendar.types.js'
import type { CalendarMessages } from '../../../lib/Calendar/messages.js'
export interface CalendarHeaderInternalProps extends CalendarHeaderProps {
    dialogId: string
}

export interface FastEditOption {
    value: string
    label: string
}

export interface FastEditSelectProps {
    value: string
    options: FastEditOption[]
    className?: string
    onChange: (value: string) => void
    messages: CalendarMessages
    ariaLabel: string
    disabled?: boolean
    readOnly?: boolean
    portalOwnerId: string
}
