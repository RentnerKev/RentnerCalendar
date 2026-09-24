import { CustomCalendar } from './Calendar.js'
import type { CalendarValue, SingleCalendarProps } from './types.js'

export function SingleCalendar({
    mode: _mode,
    onChange,
    getFormValue,
    ...props
}: SingleCalendarProps) {
    void _mode

    function handleChange(value: CalendarValue) {
        onChange?.(value instanceof Date ? value : undefined)
    }

    function handleGetFormValue(value: CalendarValue) {
        return value instanceof Date ? (getFormValue?.(value) ?? '') : ''
    }

    return (
        <CustomCalendar
            {...props}
            enableRange={false}
            switchMode={false}
            onChange={onChange ? handleChange : undefined}
            getFormValue={getFormValue ? handleGetFormValue : undefined}
        />
    )
}
