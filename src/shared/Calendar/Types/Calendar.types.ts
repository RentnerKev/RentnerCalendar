import type { AriaAttributes, FocusEventHandler, ReactNode, Ref } from 'react'
import type {
    CalendarLocale,
    CalendarMessages,
} from '../../../lib/Calendar/Types/Messages.types.ts'

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

export interface CalendarAppearance {
    controlSize?: 'sm' | 'md' | 'lg'
    classNames?: CalendarClassNames
    portalContainer?: Element | DocumentFragment | null
    portalClassName?: string
    portalZIndex?: number
}

export interface CalendarClassNames {
    root?: string
    label?: string
    description?: string
    error?: string
    control?: string
    leading?: string
    trailing?: string
    header?: string
    selectTrigger?: string
    selectContent?: string
    selectSearch?: string
    selectOption?: string
    time?: string
    portal?: string
}

export interface CalendarInternalProps
    extends AriaAttributes, CalendarAppearance {
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
    minDate?: CalendarDateInput
    maxDate?: CalendarDateInput
    minDateTime?: CalendarDateInput
    maxDateTime?: CalendarDateInput
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
    CalendarInternalProps,
    'value' | 'onChange' | 'getFormValue' | 'enableRange' | 'switchMode'
>

type SingleDateCalendarProps = CalendarSharedProps & {
    mode?: 'single'
    value?: SingleCalendarInputValue
    onChange?: (value: SingleCalendarValue) => void
    getFormValue?: (value: Date) => string
}

type RangeDateCalendarProps = CalendarSharedProps & {
    mode?: 'range'
    value?: RangeCalendarInputValue
    onChange?: (value: RangeCalendarValue) => void
    getFormValue?: (value: CalendarRange) => string
}

export type CalendarValueFormat = 'date' | 'iso-date' | 'iso-datetime'
export type SerializedCalendarSelection =
    | string
    | [string | null, string | null]
    | undefined

type SerializedProps = { valueFormat: 'iso-date' | 'iso-datetime' }
export type CalendarProps =
    | (CalendarInternalProps & { valueFormat?: 'date' })
    | (Omit<CalendarInternalProps, 'value' | 'onChange'> &
          SerializedProps & {
              value?: string | readonly [string | null, string | null] | null
              onChange?: (value: SerializedCalendarSelection) => void
          })
export type SingleCalendarProps =
    | (SingleDateCalendarProps & { valueFormat?: 'date' })
    | (Omit<SingleDateCalendarProps, 'value' | 'onChange'> &
          SerializedProps & {
              value?: string | null
              onChange?: (value: string | undefined) => void
          })
export type RangeCalendarProps =
    | (RangeDateCalendarProps & { valueFormat?: 'date' })
    | (Omit<RangeDateCalendarProps, 'value' | 'onChange'> &
          SerializedProps & {
              value?: readonly [string | null, string | null] | null
              onChange?: (
                  value: [string | null, string | null] | undefined,
              ) => void
          })

export type CalendarModeProps =
    | (SingleCalendarProps & { mode: 'single' })
    | (RangeCalendarProps & { mode: 'range' })

export interface CalendarHeaderProps extends CalendarAppearance {
    currentDate: Date
    onPrevMonth: () => void
    onNextMonth: () => void
    onViewDateChange: (date: Date) => void
    fastEdit?: boolean
    customDesign?: CalendarCustomDesign
    messages?: CalendarMessages
    monthHeadingId?: string
    disabled?: boolean
    readOnly?: boolean
}

export interface CalendarGridProps {
    handleGetDaysInMonth: () => { date: Date; isCurrentMonth: boolean }[]
    selectedDate?: CalendarValue
    onSelectDate: (date: Date) => void
    enableRange?: boolean
    enableTime?: boolean
    customDesign?: CalendarCustomDesign
    minDate?: Date
    maxDate?: Date
    minDateTime?: CalendarDateInput
    maxDateTime?: CalendarDateInput
    minTime?: string
    maxTime?: string
    weekStartsOn?: 1 | 2 | 3 | 4 | 5 | 6 | 7
    visibleDays?: number
    showHolidays?: boolean
    locale?: CalendarLocale
    messages?: CalendarMessages
    disabled?: boolean
    readOnly?: boolean
}

export interface CalendarTimeInputProps extends CalendarAppearance {
    value?: CalendarValue
    onChange: (value: CalendarValue) => void
    enableRange?: boolean
    customDesign?: CalendarCustomDesign
    minDateTime?: CalendarDateInput
    maxDateTime?: CalendarDateInput
    minTime?: string
    maxTime?: string
    messages?: CalendarMessages
    disabled?: boolean
    readOnly?: boolean
}
