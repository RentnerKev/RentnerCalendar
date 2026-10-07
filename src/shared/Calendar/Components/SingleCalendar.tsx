import { CustomCalendar } from './Calendar.js'
import useSingleCalendarLogic from '../Hooks/useSingleCalendarLogic.js'
import type { SingleCalendarProps } from '../Types/Calendar.types.js'

export function SingleCalendar(inputProps: SingleCalendarProps) {
    const {
        state: { props },
        handler,
    } = useSingleCalendarLogic(inputProps)
    return (
        <CustomCalendar
            {...props}
            enableRange={false}
            switchMode={false}
            onChange={handler.onChange}
            getFormValue={handler.getFormValue}
        />
    )
}
