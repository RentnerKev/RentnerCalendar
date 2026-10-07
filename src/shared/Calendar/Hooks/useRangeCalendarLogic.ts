import type { RangeCalendarLogicResult } from '../Types/RangeCalendarLogicResult.types.js'
import { isCalendarRange } from '../../../lib/Calendar/CalendarValue.js'
import type {
    CalendarValue,
    RangeCalendarProps,
} from '../Types/Calendar.types.js'

export default function useRangeCalendarLogic({
    mode: _mode,
    onChange,
    getFormValue,
    ...props
}: RangeCalendarProps): RangeCalendarLogicResult {
    void _mode

    function handleChange(value: CalendarValue) {
        onChange?.(isCalendarRange(value) ? value : undefined)
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
