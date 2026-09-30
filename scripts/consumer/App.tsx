import { useState } from 'react'
import {
    RangeCalendar,
    SingleCalendar,
    type RangeCalendarValue,
    type SingleCalendarValue,
} from '@rentnerkev/calendar'

function createUtcDate(value: string) {
    return new Date(`${value}.000Z`)
}

function serializeDate(value: Date | null | undefined) {
    return value?.toISOString() ?? null
}

function serializeRange(value: RangeCalendarValue) {
    return value
        ? ([serializeDate(value[0]), serializeDate(value[1])] as const)
        : null
}

export function App() {
    const [singleValue, setSingleValue] = useState<SingleCalendarValue>(() =>
        createUtcDate('2030-12-24T19:00:00'),
    )
    const [singleCallback, setSingleCallback] = useState(
        '2030-12-24T19:00:00.000Z',
    )
    const [singleBlurCount, setSingleBlurCount] = useState(0)
    const [rangeValue, setRangeValue] = useState<RangeCalendarValue>(() => [
        createUtcDate('2030-12-24T12:00:00'),
        createUtcDate('2030-12-24T13:00:00'),
    ])
    const [rangeCallbackHistory, setRangeCallbackHistory] = useState<
        Array<ReturnType<typeof serializeRange>>
    >([])

    return (
        <section aria-label="Calendar consumer contract fixture">
            <h2>Calendar consumer contract</h2>
            <form id="calendar-consumer-form">
                <div>
                    <SingleCalendar
                        id="single-calendar"
                        name="single"
                        label="Single appointment"
                        locale="en"
                        value={singleValue}
                        formValueFormat="iso-datetime"
                        enableTime
                        onChange={(nextValue) => {
                            setSingleValue(nextValue)
                            setSingleCallback(serializeDate(nextValue) ?? '')
                        }}
                        onBlur={() => setSingleBlurCount((count) => count + 1)}
                    />
                    <output
                        aria-label="Single calendar callback value"
                        data-testid="single-callback"
                    >
                        {singleCallback}
                    </output>
                    <output
                        aria-label="Single calendar blur count"
                        data-testid="single-blur-count"
                    >
                        {singleBlurCount}
                    </output>
                </div>

                <div>
                    <RangeCalendar
                        id="range-calendar"
                        name="range"
                        label="Appointment period"
                        locale="en"
                        value={rangeValue}
                        formValueFormat="iso-datetime"
                        enableTime
                        onChange={(nextValue) => {
                            setRangeValue(nextValue)
                            setRangeCallbackHistory((history) => [
                                ...history,
                                serializeRange(nextValue),
                            ])
                        }}
                    />
                    <output
                        aria-label="Range calendar callback history"
                        data-testid="range-callback-history"
                    >
                        {JSON.stringify(rangeCallbackHistory)}
                    </output>
                </div>
            </form>
            <button data-testid="outside-focus" type="button">
                Outside calendar fields
            </button>
        </section>
    )
}
