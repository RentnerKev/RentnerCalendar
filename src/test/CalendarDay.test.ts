import { describe, expect, test } from 'bun:test'
import { isCalendarDayWithinBounds } from '../Tools/CalendarDay.js'
import { formatCalendarValue } from '../Tools/FormatFunctions.js'
import { completeCalendarRange } from '../Tools/CalendarSelection.js'

describe('calendar-day ranges', () => {
    test('normalizes backward date-only selections to inclusive day boundaries', () => {
        const range = completeCalendarRange(
            new Date(2026, 8, 22, 0, 0),
            new Date(2026, 8, 18, 0, 0),
            false,
        )

        expect(range[0]?.getFullYear()).toBe(2026)
        expect(range[0]?.getMonth()).toBe(8)
        expect(range[0]?.getDate()).toBe(18)
        expect(range[0]?.getHours()).toBe(0)
        expect(range[0]?.getMinutes()).toBe(0)
        expect(range[1]?.getDate()).toBe(22)
        expect(range[1]?.getHours()).toBe(23)
        expect(range[1]?.getMinutes()).toBe(59)
        expect(range[1]?.getSeconds()).toBe(59)
        expect(range[1]?.getMilliseconds()).toBe(999)
        expect(formatCalendarValue(range)).toBe('18.09.2026 - 22.09.2026')
    })

    test('keeps both ends inclusive when a range spans the spring DST change', () => {
        const range = completeCalendarRange(
            new Date(2026, 2, 29, 0, 0),
            new Date(2026, 2, 28, 0, 0),
            false,
        )

        expect(range[0]?.getDate()).toBe(28)
        expect(range[0]?.getHours()).toBe(0)
        expect(range[1]?.getDate()).toBe(29)
        expect(range[1]?.getHours()).toBe(23)
        expect(range[1]?.getMinutes()).toBe(59)
    })

    test('keeps both ends inclusive when a range spans the autumn DST change', () => {
        const range = completeCalendarRange(
            new Date(2026, 9, 26, 0, 0),
            new Date(2026, 9, 24, 0, 0),
            false,
        )

        expect(range[0]?.getDate()).toBe(24)
        expect(range[0]?.getHours()).toBe(0)
        expect(range[1]?.getDate()).toBe(26)
        expect(range[1]?.getHours()).toBe(23)
        expect(range[1]?.getMinutes()).toBe(59)
    })

    test('keeps timed range boundaries at the selected minute', () => {
        const range = completeCalendarRange(
            new Date(2026, 8, 18, 9, 15),
            new Date(2026, 8, 19),
            true,
            new Date(2026, 8, 19, 10, 45, 37, 500),
        )

        expect(range[0]?.getHours()).toBe(9)
        expect(range[0]?.getMinutes()).toBe(15)
        expect(range[1]?.getHours()).toBe(10)
        expect(range[1]?.getMinutes()).toBe(45)
        expect(range[1]?.getSeconds()).toBe(0)
        expect(range[1]?.getMilliseconds()).toBe(0)
    })

    test('compares min and max as inclusive local calendar days', () => {
        const minDate = new Date(2026, 2, 29, 23, 45)
        const maxDate = new Date(2026, 2, 31, 1, 15)

        expect(
            isCalendarDayWithinBounds(new Date(2026, 2, 29), minDate, maxDate),
        ).toBe(true)
        expect(
            isCalendarDayWithinBounds(new Date(2026, 2, 28), minDate, maxDate),
        ).toBe(false)
        expect(
            isCalendarDayWithinBounds(new Date(2026, 3, 1), minDate, maxDate),
        ).toBe(false)
    })
})
