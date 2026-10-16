import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { CalendarProvider, SingleCalendar } from '../index.ts'

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

test('merges provider slots and preserves local replacement defaults during SSR', () => {
    const markup = renderToStaticMarkup(
        <CalendarProvider
            controlSize="lg"
            classNames={{
                label: 'provider-label',
                control: 'provider-control',
            }}
        >
            <CalendarProvider
                classNames={{ description: 'nested-description' }}
            >
                <SingleCalendar
                    label="Date"
                    description="Details"
                    controlSize="sm"
                    classNames={{ control: 'local-control' }}
                />
            </CalendarProvider>
        </CalendarProvider>,
    )
    expect(markup).toContain('provider-label')
    expect(markup).toContain('nested-description')
    expect(markup).toContain('local-control')
    expect(markup).toContain('h-rentner-control-sm')
    expect(markup).not.toContain('provider-control')
    expect(markup).not.toContain('bg-rentner-control')
    expect(markup).not.toContain('h-rentner-control-lg')
})
