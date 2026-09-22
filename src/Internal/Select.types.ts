import type { ReactNode } from 'react'
import type { CalendarMessages } from '../messages.js'

export interface Option {
    value: string
    label: string
    subOption?: string
}

export interface CustomSelectProps {
    id?: string
    name?: string
    value: string
    onValueChange: (value: string) => void
    options: Array<Option>
    required?: boolean
    icon?: ReactNode
    placeholder?: string
    className?: string
    fallbackOption?: string
    multiple?: boolean
    minSelection?: number
    maxSelection?: number
    messages?: CalendarMessages
    disabled?: boolean
    readOnly?: boolean
    'aria-label'?: string
}
