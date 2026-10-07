import { CustomCalendar } from './Calendar.js'
import useRangeCalendarLogic from '../Hooks/useRangeCalendarLogic.js'
import type { RangeCalendarProps } from '../Types/Calendar.types.js'

export function RangeCalendar(inputProps: RangeCalendarProps) {
    const {
        state: { props },
        handler,
    } = useRangeCalendarLogic(inputProps)
    return (
        <CustomCalendar
            {...props}
            enableRange
            switchMode={false}
            onChange={handler.onChange}
            getFormValue={handler.getFormValue}
        />
    )
}
