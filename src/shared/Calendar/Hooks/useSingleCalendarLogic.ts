import { serializeCalendarValue } from '../../../lib/Calendar/CalendarValue.ts'
import type { SingleCalendarLogicResult } from '../Types/SingleCalendarLogicResult.types.ts'
import type {
    CalendarValue,
    SingleCalendarProps,
} from '../Types/Calendar.types.ts'

export default function useSingleCalendarLogic(
    inputProps: SingleCalendarProps,
): SingleCalendarLogicResult {
    const {
        mode: _mode,
        onChange,
        getFormValue,
        valueFormat: _valueFormat,
        ...props
    } = inputProps
    void _mode
    void _valueFormat

    function handleChange(value: CalendarValue) {
        const selected = value instanceof Date ? value : undefined
        if (
            inputProps.valueFormat === undefined ||
            inputProps.valueFormat === 'date'
        )
            inputProps.onChange?.(selected)
        if (
            inputProps.valueFormat === 'iso-date' ||
            inputProps.valueFormat === 'iso-datetime'
        )
            inputProps.onChange?.(
                serializeCalendarValue(selected, {
                    format:
                        inputProps.valueFormat === 'iso-date'
                            ? 'date'
                            : 'datetime',
                }),
            )
    }

    function handleGetFormValue(value: CalendarValue) {
        return value instanceof Date ? (getFormValue?.(value) ?? '') : ''
    }

    return {
        state: { props },
        handler: {
            onChange: onChange ? handleChange : undefined,
            getFormValue: getFormValue ? handleGetFormValue : undefined,
        },
    }
}
