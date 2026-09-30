import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RangeCalendar, SingleCalendar } from '../../src/index.js'
import type { RangeCalendarValue } from '../../src/index.js'
import './index.css'

function formatLocalDateTime(date: Date | null | undefined) {
    if (!date) return ''

    const pad = (value: number) => String(value).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatRange(value: RangeCalendarValue) {
    return value
        ? `${formatLocalDateTime(value[0])}|${formatLocalDateTime(value[1])}`
        : ''
}

function App() {
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

    return (
        <main className="min-h-screen bg-[#101419] p-8 text-gray-200">
            <div className="mx-auto grid max-w-3xl gap-6">
                <h1 className="text-2xl font-bold text-white">
                    Calendar DST regression fixture
                </h1>

                <section className="grid gap-2">
                    <SingleCalendar
                        id="minimum-selection"
                        label="Minimum selection"
                        locale="en"
                        value={minimumSelection}
                        onChange={setMinimumSelection}
                        enableTime
                        minTime="02:30"
                        maxTime="03:30"
                        button
                    />
                    <output data-testid="minimum-selection-value">
                        {formatLocalDateTime(minimumSelection)}
                    </output>
                </section>

                <section className="grid gap-2">
                    <RangeCalendar
                        id="bounded-range"
                        label="Bounded range"
                        locale="en"
                        value={boundedRange}
                        onChange={setBoundedRange}
                        enableTime
                        minTime="01:30"
                        maxTime="02:30"
                        button
                    />
                    <output data-testid="bounded-range-value">
                        {formatRange(boundedRange)}
                    </output>
                </section>

                <section className="grid gap-2">
                    <SingleCalendar
                        id="carried-time"
                        label="Carried time"
                        locale="en"
                        value={carriedTime}
                        onChange={(value) => value && setCarriedTime(value)}
                        enableTime
                        button
                    />
                    <output data-testid="carried-time-value">
                        {formatLocalDateTime(carriedTime)}
                    </output>
                </section>

                <section className="grid gap-2">
                    <RangeCalendar
                        id="available-range"
                        label="Available range"
                        locale="en"
                        value={availableRange}
                        onChange={setAvailableRange}
                        enableTime
                        minTime="02:30"
                        maxTime="02:45"
                        button
                    />
                    <output data-testid="available-range-value">
                        {formatRange(availableRange)}
                    </output>
                </section>

                <section className="grid gap-2">
                    <RangeCalendar
                        id="invalid-range"
                        label="Invalid range"
                        locale="en"
                        value={invalidRange}
                        onChange={setInvalidRange}
                        enableTime
                        minTime="02:30"
                        maxTime="02:45"
                        button
                    />
                    <output data-testid="invalid-range-value">
                        {formatRange(invalidRange)}
                    </output>
                </section>

                <section className="grid gap-2">
                    <button
                        id="tighten-minimum"
                        type="button"
                        className="w-fit rounded border border-gray-600 px-3 py-2"
                        onClick={() => setMinimum('13:00')}
                    >
                        Tighten minimum to 13:00
                    </button>
                    <SingleCalendar
                        id="dynamic-bounds"
                        label="Dynamic bounds"
                        locale="en"
                        value={boundedValue}
                        onChange={(value) => value && setBoundedValue(value)}
                        enableTime
                        minTime={minimum}
                        maxTime="18:00"
                        button
                        backdrop={false}
                    />
                    <output data-testid="dynamic-bounds-value">
                        {formatLocalDateTime(boundedValue)}
                    </output>
                </section>
            </div>
        </main>
    )
}

createRoot(document.getElementById('root')!).render(<App />)
