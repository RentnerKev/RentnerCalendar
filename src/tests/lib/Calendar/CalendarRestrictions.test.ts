import { describe, expect, test } from 'bun:test'
import {
    calendarValueAllowsDates,
    isCalendarDateDisabled,
} from '../../../lib/Calendar/CalendarRestrictions.ts'

describe('calendar date restrictions', () => {
    test('combines ISO weekdays and individual dates without mutating selected values', () => {
        const date = new Date(2026, 9, 20, 14, 30)
        expect(
            isCalendarDateDisabled(date, {
                disabledWeekdays: [6, 7],
                isDateDisabled: (day) => {
                    day.setHours(9)
                    return day.getDate() === 20
                },
            }),
        ).toBe(true)
        expect(date.getHours()).toBe(14)
        expect(
            isCalendarDateDisabled(new Date(2026, 9, 18), {
                disabledWeekdays: [7],
            }),
        ).toBe(true)
        expect(
            isCalendarDateDisabled(new Date(2026, 9, 19), {
                disabledWeekdays: [7],
            }),
        ).toBe(false)
    })
    test('rejects restricted interior days in either range direction', () => {
        const restrictions = {
            isDateDisabled: (day: Date) => day.getDate() === 18,
        }
        const first = new Date(2026, 9, 16)
        const last = new Date(2026, 9, 19)
        expect(calendarValueAllowsDates([first, last], restrictions)).toBe(
            false,
        )
        expect(calendarValueAllowsDates([last, first], restrictions)).toBe(
            false,
        )
        expect(calendarValueAllowsDates([first, null], restrictions)).toBe(true)
        expect(
            calendarValueAllowsDates(
                [new Date(2026, 9, 18), null],
                restrictions,
            ),
        ).toBe(false)
        expect(calendarValueAllowsDates(undefined, restrictions)).toBe(true)
    })
    test('walks local calendar days across DST changes', () => {
        const previous = process.env.TZ
        process.env.TZ = 'Europe/Berlin'
        try {
            expect(
                calendarValueAllowsDates(
                    [new Date(2026, 2, 28), new Date(2026, 2, 30)],
                    { isDateDisabled: (day) => day.getDate() === 29 },
                ),
            ).toBe(false)
        } finally {
            if (previous === undefined) delete process.env.TZ
            else process.env.TZ = previous
        }
    })
})
