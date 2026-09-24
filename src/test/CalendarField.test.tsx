import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { CustomCalendar } from '../Calendar.js'
import { serializeCalendarISODate } from '../Tools/CalendarValue.js'
import {
    mergeAriaIds,
    resolveCalendarFieldError,
} from '../Tools/CalendarField.js'

describe('calendar field helpers', () => {
    test('external errors take precedence and null suppresses validation', () => {
        expect(resolveCalendarFieldError('Serverfehler', 'Pflichtfeld')).toBe(
            'Serverfehler',
        )
        expect(resolveCalendarFieldError(null, 'Pflichtfeld')).toBeNull()
        expect(resolveCalendarFieldError(undefined, 'Pflichtfeld')).toBe(
            'Pflichtfeld',
        )
    })

    test('merges aria IDs without duplicates', () => {
        expect(
            mergeAriaIds('custom description', 'field-description', 'error'),
        ).toBe('custom description field-description error')
        expect(mergeAriaIds(undefined, null, '')).toBeUndefined()
    })
})

describe('calendar field contract rendering', () => {
    test('renders stable label, description, error and disabled form semantics', () => {
        const markup = renderToStaticMarkup(
            <CustomCalendar
                id="appointment"
                name="appointment"
                label="Termin"
                description="Bitte auswählen"
                error="Serverfehler"
                required
                disabled
                aria-describedby="custom-help"
                aria-controls="appointment-dialog"
                aria-keyshortcuts="Alt+ArrowDown"
            />,
        )

        expect(markup).toContain('id="appointment-label"')
        expect(markup).not.toContain('aria-label="Kalender öffnen"')
        expect(markup).toContain('id="appointment-description"')
        expect(markup).toContain('id="appointment-error"')
        expect(markup).toContain(
            'aria-describedby="custom-help appointment-description appointment-error"',
        )
        expect(markup).not.toContain('aria-required="true"')
        expect(markup).toContain('aria-errormessage="appointment-error"')
        expect(markup).toContain('aria-disabled="true"')
        expect(markup).toContain('aria-controls="appointment-dialog"')
        expect(markup).toContain('aria-keyshortcuts="Alt+ArrowDown"')
        expect(markup).toContain('name="appointment"')
        expect(markup).toContain('disabled=""')
        expect(markup).not.toContain('required=""')
    })

    test('keeps a read-only value in the form while preventing interaction', () => {
        const markup = renderToStaticMarkup(
            <CustomCalendar
                id="appointment"
                name="appointment"
                value={new Date(2026, 8, 21)}
                readOnly
            />,
        )

        expect(markup).toContain('aria-readonly="true"')
        expect(markup).toContain('name="appointment"')
        expect(markup).toContain('readOnly=""')
        expect(markup).not.toContain('name="appointment" disabled=""')
    })

    test('keeps localized form values by default and allows ISO serialization', () => {
        const date = new Date(2026, 8, 21)
        const defaultMarkup = renderToStaticMarkup(
            <CustomCalendar name="appointment" value={date} locale="en" />,
        )
        const isoMarkup = renderToStaticMarkup(
            <CustomCalendar
                name="appointment"
                value={date}
                locale="en"
                getFormValue={(value) =>
                    value instanceof Date
                        ? (serializeCalendarISODate(value) ?? '')
                        : ''
                }
            />,
        )

        expect(defaultMarkup).toContain('name="appointment" value="09/21/2026"')
        expect(isoMarkup).toContain('name="appointment" value="2026-09-21"')
        expect(isoMarkup).toContain('09/21/2026')
    })

    test('lets range consumers define one explicit form value', () => {
        const markup = renderToStaticMarkup(
            <CustomCalendar
                name="period"
                enableRange
                value={[new Date(2026, 8, 21), new Date(2026, 8, 24)]}
                getFormValue={(value) =>
                    Array.isArray(value)
                        ? value
                              .map((date) => serializeCalendarISODate(date))
                              .join('/')
                        : ''
                }
            />,
        )

        expect(markup).toContain('name="period" value="2026-09-21/2026-09-24"')
    })

    test('keeps an empty range empty with a form serializer', () => {
        const markup = renderToStaticMarkup(
            <CustomCalendar
                name="period"
                enableRange
                value={[null, null]}
                getFormValue={() => 'unexpected'}
            />,
        )

        expect(markup).toContain('name="period" value=""')
        expect(markup).not.toContain('unexpected')
    })

    test('lets an explicit null error clear native required validation', () => {
        const markup = renderToStaticMarkup(
            <CustomCalendar
                id="appointment"
                name="appointment"
                required
                error={null}
            />,
        )

        expect(markup).not.toContain('required=""')
        expect(markup).not.toContain('aria-required="true"')
        expect(markup).not.toContain('aria-invalid="true"')
        expect(markup).not.toContain('appointment-error')
    })
})
