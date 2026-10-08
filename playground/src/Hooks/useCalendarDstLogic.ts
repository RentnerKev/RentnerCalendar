import { useState } from 'react'
import type { RangeCalendarValue } from '../../../src/shared/Calendar/Types/Calendar.types.ts'
import type { CalendarDstLogicResult } from '../Types/CalendarDst.types.ts'
export function useCalendarDstLogic(): CalendarDstLogicResult {
    const [minimumSelection, setMinimumSelection] = useState<Date>()
    const [boundedRange, setBoundedRange] = useState<RangeCalendarValue>()
    const [carriedTime, setCarriedTime] = useState(
        () => new Date(2026, 2, 28, 2, 30),
    )
    const [availableRange, setAvailableRange] = useState<RangeCalendarValue>([
        new Date(2026, 2, 28, 2, 30),
        null,
    ])
    const [invalidRange, setInvalidRange] = useState<RangeCalendarValue>([
        new Date(2026, 2, 29, 3, 0),
        null,
    ])
    const [boundedValue, setBoundedValue] = useState(
        () => new Date(2026, 2, 28, 12, 0),
    )
    const [minimum, setMinimum] = useState('00:00')

    function handleCarriedTime(value: Date | undefined) {
        if (value) setCarriedTime(value)
    }
    function handleBoundedValue(value: Date | undefined) {
        if (value) setBoundedValue(value)
    }
    function handleTightenMinimum() {
        setMinimum('13:00')
    }
    return {
        state: {
            minimumSelection,
            boundedRange,
            carriedTime,
            availableRange,
            invalidRange,
            boundedValue,
            minimum,
        },
        setter: {
            setMinimumSelection,
            setBoundedRange,
            setCarriedTime,
            setAvailableRange,
            setInvalidRange,
            setBoundedValue,
            setMinimum,
        },
        handler: {
            handleCarriedTime,
            handleBoundedValue,
            handleTightenMinimum,
        },
    }
}
