import { useCalendarDstLogic } from './Hooks/useCalendarDstLogic.ts'
import { createRoot } from 'react-dom/client'
import { RangeCalendar } from '../../src/shared/Calendar/Components/RangeCalendar.tsx'
import { SingleCalendar } from '../../src/shared/Calendar/Components/SingleCalendar.tsx'
import {
    formatLocalDateTime,
    formatRange,
} from './lib/Calendar/calendarDateTime.ts'
// oxlint-disable-next-line import/no-unassigned-import -- Playground CSS entry.
import './index.css'

function App() {
    const {
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
            setAvailableRange,
            setInvalidRange,
        },
        handler: {
            handleCarriedTime,
            handleBoundedValue,
            handleTightenMinimum,
        },
    } = useCalendarDstLogic()
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
                        onChange={handleCarriedTime}
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
                        className="fixed top-4 right-4 z-[10000] w-fit rounded border border-gray-600 bg-[#101419] px-3 py-2"
                        onClick={handleTightenMinimum}
                    >
                        Tighten minimum to 13:00
                    </button>
                    <SingleCalendar
                        id="dynamic-bounds"
                        label="Dynamic bounds"
                        locale="en"
                        value={boundedValue}
                        onChange={handleBoundedValue}
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
