import type { CalendarValue, SingleCalendarProps } from './Calendar.types.ts'

export type SingleCalendarLogicResult = {
    state: {
        props: Omit<SingleCalendarProps, 'mode' | 'onChange' | 'getFormValue'>
    }
    handler: {
        onChange: ((value: CalendarValue) => void) | undefined
        getFormValue: ((value: CalendarValue) => string) | undefined
    }
}
