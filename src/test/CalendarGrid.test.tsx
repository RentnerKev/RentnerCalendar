import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CalendarGrid from '../Components/CalendarGrid.js'
import {
    createCalendarDate,
    getCalendarMonthDays,
} from '../Tools/CalendarDay.js'

function findDayButton(markup: string, date: string) {
    return markup.match(
        new RegExp(`<button\\b(?=[^>]*data-calendar-date="${date}")[^>]*>`),
    )?.[0]
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
})
