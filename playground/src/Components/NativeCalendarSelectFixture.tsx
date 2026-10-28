import { useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { CustomSelect } from '../../../src/shared/Calendar/Components/Internal/Select.tsx'

const options = [
    { value: 'alpha', label: 'Alpha' },
    { value: 'beta', label: 'Beta' },
    { value: 'gamma', label: 'Gamma' },
]

function useNativeCalendarSelectFixtureLogic() {
    const [shadow, setShadow] = useState<ShadowRoot | null>(null)
    const [firstTarget, setFirstTarget] = useState<HTMLDivElement | null>(null)
    const [secondTarget, setSecondTarget] = useState<HTMLDivElement | null>(
        null,
    )
    const [moved, setMoved] = useState(false)
    const [value, setValue] = useState('')
    const setShadowHost = useCallback((host: HTMLDivElement | null) => {
        setShadow(
            host
                ? (host.shadowRoot ?? host.attachShadow({ mode: 'open' }))
                : null,
        )
    }, [])
    return {
        state: {
            shadow,
            portalTarget: moved ? secondTarget : firstTarget,
            value,
        },
        refs: { setShadowHost, setFirstTarget, setSecondTarget },
        handler: { movePortal: () => setMoved(true), changeValue: setValue },
    }
}

/** Isolated playground fixture for native select lifecycle regressions. */
export function NativeCalendarSelectFixture() {
    const {
        state,
        refs: { setShadowHost, setFirstTarget, setSecondTarget },
        handler,
    } = useNativeCalendarSelectFixtureLogic()
    return (
        <main data-testid="native-select-fixture">
            <h1>Native calendar select regression fixture</h1>
            <div ref={setShadowHost} data-testid="native-shadow-host" />
            {state.shadow &&
                createPortal(
                    <CustomSelect
                        aria-label="Shadow native select"
                        value={state.value}
                        onValueChange={handler.changeValue}
                        options={options}
                        portalContainer={state.shadow}
                    />,
                    state.shadow,
                )}
            <CustomSelect
                aria-label="Moving native select"
                value={state.value}
                onValueChange={handler.changeValue}
                options={options}
                portalContainer={state.portalTarget}
            />
            <button type="button" onClick={handler.movePortal}>
                Move open portal
            </button>
            <div ref={setFirstTarget} data-testid="first-native-target" />
            <div ref={setSecondTarget} data-testid="second-native-target" />
            <CustomSelect
                aria-label="First native select"
                value={state.value}
                onValueChange={handler.changeValue}
                options={options}
            />
            <CustomSelect
                aria-label="Second native select"
                value={state.value}
                onValueChange={handler.changeValue}
                options={options}
            />
        </main>
    )
}
