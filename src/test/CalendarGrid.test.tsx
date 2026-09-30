import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CalendarGrid from '../Components/CalendarGrid.js'
import {
    createCalendarDate,
    getCalendarMonthDays,
} from '../Tools/CalendarDay.js'

function withTimeZone<T>(timeZone: string, run: () => T) {
    const previousTimeZone = process.env.TZ
    process.env.TZ = timeZone

    try {
        return run()
    } finally {
        if (previousTimeZone === undefined) {
            delete process.env.TZ
        } else {
            process.env.TZ = previousTimeZone
        }
    }
}

function findDayButton(markup: string, date: string) {
    return markup.match(
        new RegExp(`<button\\b(?=[^>]*data-calendar-date="${date}")[^>]*>`),
    )?.[0]
}

function findDayCell(markup: string, date: string) {
    const buttonStart = markup.indexOf(`data-calendar-date="${date}"`)
    const cellStart = markup.lastIndexOf('<div role="gridcell"', buttonStart)
    const cellEnd = markup.indexOf('</div>', buttonStart)
    return markup.slice(cellStart, cellEnd + '</div>'.length)
}

describe('calendar grid accessibility and date bounds', () => {
    test('renders one date tab stop and marks dates outside inclusive bounds disabled', () => {
        const currentDate = new Date(2026, 8, 1)
        const firstVisibleDate = new Date(2026, 7, 31)
        const days = Array.from({ length: 42 }, (_, index) => {
            const date = new Date(firstVisibleDate)
            date.setDate(firstVisibleDate.getDate() + index)
            return {
                date,
                isCurrentMonth: date.getMonth() === currentDate.getMonth(),
            }
        })
        const markup = renderToStaticMarkup(
            <CalendarGrid
                currentDate={currentDate}
                monthHeadingId="month-heading"
                keyboardHelpId="keyboard-help"
                onViewDateChange={() => undefined}
                handleGetDaysInMonth={() => days}
                onSelectDate={() => undefined}
                minDate={new Date(2026, 8, 10, 20, 0)}
                maxDate={new Date(2026, 8, 20, 1, 0)}
            />,
        )

        expect((markup.match(/tabindex="0"/g) ?? []).length).toBe(1)
        expect(markup).toContain('role="grid"')
        expect(markup).toContain('aria-labelledby="month-heading"')
        expect((markup.match(/role="columnheader"/g) ?? []).length).toBe(7)
        expect((markup.match(/role="gridcell"/g) ?? []).length).toBe(42)
        expect(findDayButton(markup, '2026-09-09')).toContain('disabled=""')
        expect(findDayButton(markup, '2026-09-10')).not.toContain('disabled=""')
        expect(findDayButton(markup, '2026-09-20')).not.toContain('disabled=""')
        expect(findDayButton(markup, '2026-09-21')).toContain('disabled=""')
    })

    test('renders dates in years below 100 without shifting them by 1900', () => {
        const currentDate = createCalendarDate(42, 0, 1)
        const days = getCalendarMonthDays(42, 0, 1, 7)
        const markup = renderToStaticMarkup(
            <CalendarGrid
                currentDate={currentDate}
                monthHeadingId="month-heading"
                keyboardHelpId="keyboard-help"
                onViewDateChange={() => undefined}
                handleGetDaysInMonth={() => days}
                selectedDate={createCalendarDate(42, 0, 15)}
                onSelectDate={() => undefined}
            />,
        )

        expect(markup).toContain('data-calendar-date="0042-01-01"')
        expect(markup).toContain('data-calendar-date="0042-01-15"')
        expect(markup).not.toContain('data-calendar-date="1942-01-')
    })

    test('exposes every day in a selected range to assistive technology', () => {
        const currentDate = new Date(2026, 8, 1)
        const days = getCalendarMonthDays(2026, 8, 1, 7)
        const markup = renderToStaticMarkup(
            <CalendarGrid
                currentDate={currentDate}
                monthHeadingId="month-heading"
                keyboardHelpId="keyboard-help"
                onViewDateChange={() => undefined}
                handleGetDaysInMonth={() => days}
                selectedDate={[
                    new Date(2026, 8, 10, 8),
                    new Date(2026, 8, 12, 18),
                ]}
                onSelectDate={() => undefined}
                enableRange
            />,
        )

        expect(markup).toContain('aria-multiselectable="true"')
        expect(findDayCell(markup, '2026-09-11')).toContain(
            'aria-selected="true"',
        )
        expect(findDayButton(markup, '2026-09-11')).toContain(
            'aria-pressed="true"',
        )
        expect(findDayButton(markup, '2026-09-11')).toContain(
            'im ausgewählten Zeitraum',
        )
        expect(findDayButton(markup, '2026-09-10')).toContain(
            'Beginn des ausgewählten Zeitraums',
        )
        expect(findDayButton(markup, '2026-09-12')).toContain(
            'Ende des ausgewählten Zeitraums',
        )
    })

    test('disables a day when all bounded minutes fall in the spring DST gap', () => {
        withTimeZone('Europe/Berlin', () => {
            const currentDate = new Date(2026, 2, 1)
            const days = getCalendarMonthDays(2026, 2, 1, 7)
            const markup = renderToStaticMarkup(
                <CalendarGrid
                    currentDate={currentDate}
                    monthHeadingId="month-heading"
                    keyboardHelpId="keyboard-help"
                    onViewDateChange={() => undefined}
                    handleGetDaysInMonth={() => days}
                    onSelectDate={() => undefined}
                    enableTime
                    minTime="02:30"
                    maxTime="02:45"
                />,
            )

            expect(findDayButton(markup, '2026-03-28')).not.toContain(
                'disabled=""',
            )
            expect(findDayButton(markup, '2026-03-29')).toContain('disabled=""')
            expect(findDayButton(markup, '2026-03-30')).not.toContain(
                'disabled=""',
            )
        })
    })
})
