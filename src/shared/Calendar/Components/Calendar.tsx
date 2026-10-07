import CalendarPopover from './CalendarPopover.js'
import CalendarField from './CalendarField.js'
import useCustomCalendarLogic from '../Hooks/useCustomCalendarLogic.js'
import type { CalendarProps } from '../Types/Calendar.types.js'

export function CustomCalendar(props: CalendarProps) {
    const { state, handler, setter, refs } = useCustomCalendarLogic(props)
    const popoverContent = state.field.isOpen ? (
        <CalendarPopover
            {...state.popover}
            popoverRef={refs.popoverRef}
            onClose={handler.closeCalendar}
            onRangeModeChange={setter.setIsRangeMode}
            onPrevMonth={handler.handlePrevMonth}
            onNextMonth={handler.handleNextMonth}
            onViewDateChange={handler.handleViewDateChange}
            getDaysInMonth={handler.handleGetDaysInMonth}
            onSelectDate={handler.handleDateSelect}
            onTimeChange={handler.handleTimeChange}
            onApply={handler.handleApply}
        />
    ) : null
    return (
        <CalendarField
            {...state.field}
            popoverContent={popoverContent}
            handleClear={handler.handleClear}
            handleFieldBlur={handler.handleFieldBlur}
            handleInvalid={handler.handleInvalid}
            setTriggerRef={refs.setTriggerRef}
            toggleCalendar={handler.toggleCalendar}
            validationInputRef={refs.validationInputRef}
        />
    )
}
