import type { Dispatch, SetStateAction } from 'react'
import type { RangeCalendarValue } from '../../../src/shared/Calendar/Types/Calendar.types.ts'
export type CalendarDstLogicResult = {
    state: {
        minimumSelection: Date | undefined
        boundedRange: RangeCalendarValue
        carriedTime: Date
        availableRange: RangeCalendarValue
        invalidRange: RangeCalendarValue
        boundedValue: Date
        minimum: string
    }
    setter: {
        setMinimumSelection: Dispatch<SetStateAction<Date | undefined>>
        setBoundedRange: Dispatch<SetStateAction<RangeCalendarValue>>
        setCarriedTime: Dispatch<SetStateAction<Date>>
        setAvailableRange: Dispatch<SetStateAction<RangeCalendarValue>>
        setInvalidRange: Dispatch<SetStateAction<RangeCalendarValue>>
        setBoundedValue: Dispatch<SetStateAction<Date>>
        setMinimum: Dispatch<SetStateAction<string>>
    }
    handler: {
        handleCarriedTime: (value: Date | undefined) => void
        handleBoundedValue: (value: Date | undefined) => void
        handleTightenMinimum: () => void
    }
}
