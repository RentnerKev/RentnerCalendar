import type { CalendarValue, RangeCalendarProps } from './Calendar.types.ts'

export type RangeCalendarLogicResult = {
    state: {
        props: Omit<RangeCalendarProps, 'mode' | 'onChange' | 'getFormValue'>
    }
    handler: {
        onChange: ((value: CalendarValue) => void) | undefined
        getFormValue: ((value: CalendarValue) => string) | undefined
    }
}
