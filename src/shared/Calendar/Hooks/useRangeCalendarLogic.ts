import type { RangeCalendarLogicResult } from '../Types/RangeCalendarLogicResult.types.ts'
import { isCalendarRange } from '../../../lib/Calendar/CalendarValue.ts'
import type {
    CalendarValue,
    RangeCalendarProps,
} from '../Types/Calendar.types.ts'

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
