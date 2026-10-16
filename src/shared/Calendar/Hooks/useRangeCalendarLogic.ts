import { serializeCalendarValue } from '../../../lib/Calendar/CalendarValue.ts'
import type { RangeCalendarLogicResult } from '../Types/RangeCalendarLogicResult.types.ts'
import { isCalendarRange } from '../../../lib/Calendar/CalendarValue.ts'
import type {
    CalendarValue,
    RangeCalendarProps,
} from '../Types/Calendar.types.ts'

export default function useRangeCalendarLogic(
    inputProps: RangeCalendarProps,
): RangeCalendarLogicResult {
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
        const selected = isCalendarRange(value) ? value : undefined
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
        return isCalendarRange(value) ? (getFormValue?.(value) ?? '') : ''
    }

    return {
        state: { props },
        handler: {
            onChange: onChange ? handleChange : undefined,
            getFormValue: getFormValue ? handleGetFormValue : undefined,
        },
    }
}
