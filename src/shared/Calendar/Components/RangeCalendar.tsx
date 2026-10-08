import { CustomCalendar } from './Calendar.tsx'
import useRangeCalendarLogic from '../Hooks/useRangeCalendarLogic.ts'
import type { RangeCalendarProps } from '../Types/Calendar.types.ts'

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
