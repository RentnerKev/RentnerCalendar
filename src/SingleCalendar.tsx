import { CustomCalendar } from './Calendar.js'
import type { CalendarValue, SingleCalendarProps } from './types.js'

export function SingleCalendar({
    mode: _mode,
    onChange,
    ...props
}: SingleCalendarProps) {
    void _mode

    function handleChange(value: CalendarValue) {
        onChange?.(value instanceof Date ? value : undefined)
    }

    return (
        <CustomCalendar
            {...props}
            enableRange={false}
            switchMode={false}
            onChange={onChange ? handleChange : undefined}
        />
    )
}
