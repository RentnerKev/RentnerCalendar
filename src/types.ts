import type { AriaAttributes, FocusEventHandler, ReactNode, Ref } from 'react'
import type { CalendarLocale, CalendarMessages } from './messages.js'

export type CalendarRange = [Date | null, Date | null]
export type SingleCalendarValue = Date | undefined
export type RangeCalendarValue = CalendarRange | undefined
export type CalendarValue = SingleCalendarValue | RangeCalendarValue
export type CalendarFormValueFormat = 'display' | 'iso-date' | 'iso-datetime'

export type CalendarDateInput = Date | string | number | null
export type SingleCalendarInputValue = CalendarDateInput | undefined
export type RangeCalendarInputValue =
    | readonly [CalendarDateInput, CalendarDateInput]
    | null
    | undefined

export type CalendarInputValue =
    | SingleCalendarInputValue
    | RangeCalendarInputValue

export interface CalendarCustomDesign {
    primaryColor?: string
    primaryColorFocusWithin?: string
    primaryBg?: string
    primaryHover?: string
    primaryBorder?: string
    primaryFocusBorder?: string
    primaryRing?: string
    primaryBgSubtle?: string
    surfaceBackground?: string
    inputBackground?: string
    borderColor?: string
    borderTransparent?: string
    textColor?: string
    textMuted?: string
    textMutedDark?: string
    textDisabled?: string
    textDay?: string
    textBackground?: string
    hoverBackground?: string
    hoverText?: string
    hoverTextMuted?: string
}

export const defaultCalendarDesign: Required<CalendarCustomDesign> = {
    primaryColor: 'text-primary',
    primaryColorFocusWithin: 'group-focus-within:text-primary',
    primaryBg: 'bg-primary',
    primaryHover: 'hover:bg-primary-hover',
    primaryBorder: 'border-primary',
    primaryFocusBorder: 'focus:border-primary',
    primaryRing: 'focus:ring-primary/50',
    primaryBgSubtle: 'bg-primary/20',
    surfaceBackground: 'bg-surface-dark',
    inputBackground: 'bg-input-dark',
    borderColor: 'border-border-dark',
    borderTransparent: 'border-transparent',
    textColor: 'text-white',
    textMuted: 'text-gray-400',
    textMutedDark: 'text-gray-400',
    textDisabled: 'text-gray-400',
    textDay: 'text-gray-300',
    textBackground: 'text-background-dark',
    hoverBackground: 'hover:bg-white/5',
    hoverText: 'hover:text-white',
    hoverTextMuted: 'hover:text-gray-500',
}

export interface CalendarProps extends AriaAttributes {
    id?: string
    name?: string
    value?: CalendarInputValue
    onChange?: (value: CalendarValue) => void
    getFormValue?: (value: CalendarValue) => string
    formValueFormat?: CalendarFormValueFormat
    onBlur?: FocusEventHandler<HTMLDivElement>
    label?: ReactNode
    description?: ReactNode
    error?: string | null
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    triggerRef?: Ref<HTMLButtonElement>
    className?: string
    enableTime?: boolean
    enableRange?: boolean
    switchMode?: boolean
    isDeletable?: boolean
    icon?: ReactNode | boolean
    backdrop?: boolean
    button?: boolean
    placeholder?: string
    customDesign?: CalendarCustomDesign
    closeOnSelect?: boolean
    minDate?: CalendarInputValue
    maxDate?: CalendarInputValue
    minTime?: string
    maxTime?: string
    fastEdit?: boolean
    weekStartsOn?: 1 | 2 | 3 | 4 | 5 | 6 | 7
    visibleDays?: number
    showHolidays?: boolean
    locale?: CalendarLocale
    messages?: Partial<CalendarMessages>
}

export type CalendarSharedProps = Omit<
    CalendarProps,
    'value' | 'onChange' | 'getFormValue' | 'enableRange' | 'switchMode'
>

export type SingleCalendarProps = CalendarSharedProps & {
    mode?: 'single'
    value?: SingleCalendarInputValue
    onChange?: (value: SingleCalendarValue) => void
    getFormValue?: (value: Date) => string
}

export type RangeCalendarProps = CalendarSharedProps & {
    mode?: 'range'
    value?: RangeCalendarInputValue
    onChange?: (value: RangeCalendarValue) => void
    getFormValue?: (value: CalendarRange) => string
}

export type CalendarModeProps =
    | (SingleCalendarProps & { mode: 'single' })
    | (RangeCalendarProps & { mode: 'range' })

export interface CalendarHeaderProps {
    currentDate: Date
    onPrevMonth: () => void
    onNextMonth: () => void
    onViewDateChange: (date: Date) => void
    fastEdit?: boolean
    customDesign?: CalendarCustomDesign
    messages?: CalendarMessages
    disabled?: boolean
    readOnly?: boolean
}

export interface CalendarGridProps {
    handleGetDaysInMonth: () => { date: Date; isCurrentMonth: boolean }[]
    selectedDate?: CalendarValue
    onSelectDate: (date: Date) => void
    enableRange?: boolean
    customDesign?: CalendarCustomDesign
    minDate?: Date
    maxDate?: Date
    weekStartsOn?: 1 | 2 | 3 | 4 | 5 | 6 | 7
    visibleDays?: number
    showHolidays?: boolean
    locale?: CalendarLocale
    messages?: CalendarMessages
    disabled?: boolean
    readOnly?: boolean
}

export interface CalendarTimeInputProps {
    value?: CalendarValue
    onChange: (value: CalendarValue) => void
    enableRange?: boolean
    customDesign?: CalendarCustomDesign
    minTime?: string
    maxTime?: string
    messages?: CalendarMessages
    disabled?: boolean
    readOnly?: boolean
}
