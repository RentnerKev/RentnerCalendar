import { serializeCalendarValue } from './CalendarValue.ts'
import type {
    CalendarInternalProps,
    CalendarProps,
    CalendarValue,
} from '../../shared/Calendar/Types/Calendar.types.ts'

export function createCalendarValueBridge(
    props: CalendarProps,
): CalendarInternalProps {
    function handleChange(value: CalendarValue) {
        if (
            props.valueFormat === 'iso-date' ||
            props.valueFormat === 'iso-datetime'
        )
            props.onChange?.(
                serializeCalendarValue(value, {
                    format:
                        props.valueFormat === 'iso-date' ? 'date' : 'datetime',
                }),
            )
        if (props.valueFormat === undefined || props.valueFormat === 'date')
            props.onChange?.(value)
    }
    const { valueFormat: _valueFormat, onChange: _onChange, ...rest } = props
    return { ...rest, onChange: handleChange }
}
