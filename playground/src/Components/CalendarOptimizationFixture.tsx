import { CustomSelect } from '../../../src/shared/Calendar/Components/Internal/Select.tsx'
import { useCalendarOptimizationFixtureLogic } from '../Hooks/useCalendarOptimizationFixtureLogic.ts'

export function CalendarOptimizationFixture() {
    const { state, handler } = useCalendarOptimizationFixtureLogic()
    return (
        <main
            className="min-h-screen bg-surface-dark p-8 text-white"
            data-testid="calendar-optimization"
        >
            <h1>Calendar optimization regression fixture</h1>
            <output data-testid="fixture-tick">{state.tick}</output>
            <output data-testid="header-year">
                {state.header.currentYear}
            </output>
            <output data-testid="header-months">
                {state.header.monthOptions
                    .map((option) => option.label)
                    .join('|')}
            </output>
            <div className="w-80">
                <CustomSelect
                    aria-label="Optimization search"
                    options={state.options}
                    value={state.value}
                    onValueChange={handler.setValue}
                    messages={state.messages}
                />
            </div>
            <output data-testid="selected-value">{state.value}</output>
        </main>
    )
}
