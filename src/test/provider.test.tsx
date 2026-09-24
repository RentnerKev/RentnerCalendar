import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { CalendarProvider, SingleCalendar } from '../index.js'

describe('calendar provider defaults', () => {
    test('inherits locale and design through nested providers', () => {
        const markup = renderToStaticMarkup(
            <CalendarProvider
                locale="en"
                messages={{ openCalendar: 'Open project calendar' }}
                customDesign={{
                    surfaceBackground: 'bg-project-surface',
                    borderColor: 'border-project-border',
                }}
            >
                <CalendarProvider
                    customDesign={{ inputBackground: 'bg-project-input' }}
                >
                    <SingleCalendar />
                </CalendarProvider>
            </CalendarProvider>,
        )

        expect(markup).toContain('Click here to view the selections!')
        expect(markup).toContain('Open project calendar')
        expect(markup).toContain('bg-project-input')
        expect(markup).toContain('border-project-border')
    })

    test('allows calendar props to override provider defaults', () => {
        const markup = renderToStaticMarkup(
            <CalendarProvider
                locale="en"
                messages={{ placeholder: 'Choose a date' }}
                customDesign={{ inputBackground: 'bg-project-input' }}
            >
                <SingleCalendar
                    locale="de"
                    placeholder="Datum auswählen"
                    customDesign={{ inputBackground: 'bg-local-input' }}
                />
            </CalendarProvider>,
        )

        expect(markup).toContain('Datum auswählen')
        expect(markup).toContain('bg-local-input')
        expect(markup).not.toContain('Choose a date')
        expect(markup).not.toContain('bg-project-input')
    })
})
