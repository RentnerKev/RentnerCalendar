import type { CalendarTimeInputLogicResult } from '../Types/CalendarTimeInputLogicResult.types.ts'
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.ts'
import type { CalendarTimeInputProps } from '../Types/Calendar.types.ts'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.ts'
import { updateCalendarRangeBoundary } from '../../../lib/Calendar/CalendarSelection.ts'

export default function useCalendarTimeInputLogic({
    value,
    onChange,
    enableRange,
    customDesign = defaultCalendarDesign,
    minTime,
    maxTime,
    messages: providedMessages,
    disabled = false,
    readOnly = false,
}: CalendarTimeInputProps): CalendarTimeInputLogicResult {
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const messages = providedMessages ?? resolveCalendarMessages()

    const handleUpdate = (index: 0 | 1, newDate: Date) => {
        if (disabled || readOnly) {
            return
        }

        if (enableRange) {
            const range = Array.isArray(value)
                ? value
                : ([null, null] as [null, null])
            onChange(updateCalendarRangeBoundary(range, index, newDate))
        } else {
            onChange(newDate)
        }
    }

    const rangeValue = Array.isArray(value) ? value : [null, null]
    const singleDate = value instanceof Date ? value : null

    return {
        state: {
            cd,
            messages,
            rangeValue,
            singleDate,
            enableRange,
            minTime,
            maxTime,
            disabled,
            readOnly,
        },
        handler: { handleUpdate },
    }
}
