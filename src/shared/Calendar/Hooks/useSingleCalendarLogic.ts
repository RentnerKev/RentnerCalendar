import type { SingleCalendarLogicResult } from '../Types/SingleCalendarLogicResult.types.ts'
import type {
    CalendarValue,
    SingleCalendarProps,
} from '../Types/Calendar.types.ts'

export default function useSingleCalendarLogic({
    mode: _mode,
    onChange,
    getFormValue,
    ...props
}: SingleCalendarProps): SingleCalendarLogicResult {
    void _mode

    function handleChange(value: CalendarValue) {
        onChange?.(value instanceof Date ? value : undefined)
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
