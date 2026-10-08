import { CustomCalendar } from './Calendar.tsx'
import useSingleCalendarLogic from '../Hooks/useSingleCalendarLogic.ts'
import type { SingleCalendarProps } from '../Types/Calendar.types.ts'

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
