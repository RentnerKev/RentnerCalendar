import { createRoot } from 'react-dom/client'
import {
    CalendarProvider,
    SingleCalendar,
    RangeCalendar,
} from '../../src/index.ts'
import { useContractPlaygroundLogic } from './Hooks/useContractPlaygroundLogic.ts'
// oxlint-disable-next-line import/no-unassigned-import -- Browser fixture CSS entry.
import './index.css'

function ContractPlayground() {
    const {
        state,
        handler,
        setter,
        refs: { portalContainerRef },
    } = useContractPlaygroundLogic()
    return (
        <main className="p-4">
            <h1>Calendar contract</h1>
            <div data-testid="calendar-portals" ref={portalContainerRef} />
            <CalendarProvider
                locale="en"
                controlSize="lg"
                portalContainer={state.portalContainer}
                portalZIndex={12000}
                portalClassName="calendar-owned-portal"
                customDesign={{
                    inputBackground: 'bg-emerald-950',
                    surfaceBackground: 'bg-emerald-950',
                }}
                classNames={{
                    selectTrigger: 'bg-amber-100 text-black border-amber-400',
                    selectSearch: 'bg-amber-100 text-black border-amber-400',
                    selectOption: 'bg-amber-100 text-black',
                }}
            >
                <SingleCalendar
                    id="contract-single"
                    name="single"
                    label="Single instant"
                    valueFormat="iso-datetime"
                    value={state.single}
                    onChange={setter.setSingle}
                    minDateTime={state.minimum}
                    maxDateTime={new Date(2026, 9, 16, 14)}
                    minTime="08:00"
                    maxTime="17:00"
                    enableTime
                    button
                    isDeletable
                />
                <RangeCalendar
                    id="contract-range"
                    name="range"
                    label="Range days"
                    valueFormat="iso-date"
                    value={state.range}
                    onChange={setter.setRange}
                    controlSize="sm"
                    isDeletable
                />
                <RangeCalendar
                    id="contract-range-instant"
                    label="Range instants"
                    valueFormat="iso-datetime"
                    value={state.rangeInstant}
                    onChange={setter.setRangeInstant}
                    minDateTime={new Date(2026, 9, 16, 12, 30)}
                    maxDateTime={new Date(2026, 9, 16, 14)}
                    enableTime
                />
                <RangeCalendar
                    id="contract-dynamic-range"
                    label="Dynamic range"
                    valueFormat="iso-datetime"
                    value={state.rangeDynamic}
                    onChange={setter.setRangeDynamic}
                    minDateTime={state.rangeMinimum}
                    enableTime
                />
            </CalendarProvider>
            <button type="button" onClick={handler.handleLaterMinimum}>
                Later minimum
            </button>
            <button type="button" onClick={handler.handleLaterRangeMinimum}>
                Later range minimum
            </button>
            <output data-testid="dynamic-range-value">
                {JSON.stringify(state.rangeDynamic)}
            </output>
            <output data-testid="single-value">
                {state.single ?? 'undefined'}
            </output>
            <output data-testid="range-instant-value">
                {JSON.stringify(state.rangeInstant)}
            </output>
            <output data-testid="range-value">
                {state.range ? JSON.stringify(state.range) : 'undefined'}
            </output>
        </main>
    )
}
createRoot(document.getElementById('root')!).render(<ContractPlayground />)
