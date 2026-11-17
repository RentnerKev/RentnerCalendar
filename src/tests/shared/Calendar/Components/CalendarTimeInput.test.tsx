import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CalendarTimeInput from '../../../../shared/Calendar/Components/CalendarTimeInput.tsx'

test('renders a native numeric-keyboard input with controlled time and native restrictions', () => {
    const props = { value: new Date(2026, 9, 16, 12, 30), onChange: () => undefined }
    const markup = renderToStaticMarkup(<CalendarTimeInput {...props} />)
    expect(markup).toMatch(/<input[^>]*type="text"[^>]*inputMode="numeric"/)
    expect(markup).toContain('value="1230"')
    expect(markup).toContain('aria-label="Zeit 12:30"')
    const disabled = renderToStaticMarkup(<CalendarTimeInput {...props} disabled />)
    expect(disabled).toMatch(/<input[^>]*disabled=""/)
    const readOnly = renderToStaticMarkup(<CalendarTimeInput {...props} readOnly />)
    expect(readOnly).toMatch(/<input[^>]*readOnly=""/)
    const empty = renderToStaticMarkup(<CalendarTimeInput onChange={() => undefined} />)
    expect(empty).toMatch(/<input[^>]*disabled=""/)
})
