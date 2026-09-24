import { CustomCalendar } from './Calendar.js'
import { isCalendarRange } from './Tools/CalendarValue.js'
import type { CalendarValue, RangeCalendarProps } from './types.js'

export function RangeCalendar({
    mode: _mode,
    onChange,
    getFormValue,
    ...props
}: RangeCalendarProps) {
    void _mode

    function handleChange(value: CalendarValue) {
        onChange?.(isCalendarRange(value) ? value : undefined)
    }

    function handleGetFormValue(value: CalendarValue) {
        return isCalendarRange(value) ? (getFormValue?.(value) ?? '') : ''
    }

    return (
        <CustomCalendar
            {...props}
            enableRange
            switchMode={false}
            onChange={onChange ? handleChange : undefined}
            getFormValue={getFormValue ? handleGetFormValue : undefined}
        />
    )
}
