import { describe, expect, test } from 'bun:test'
import { updateCalendarRangeBoundary } from '../../../lib/Calendar/CalendarSelection.ts'
import {
    calendarValueHasTimeWithinBounds,
    constrainCalendarTime,
    hasCalendarTimeWithinBounds,
    updateCalendarTime,
} from '../../../lib/Calendar/CalendarTime.ts'

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

describe('calendar time edits', () => {
    test('validates the actual selected minute when time bounds change', () => {
        const selected = new Date(2026, 8, 10, 12)

        expect(hasCalendarTimeWithinBounds(selected, '13:00', '18:00')).toBe(
            true,
        )
        expect(
            calendarValueHasTimeWithinBounds(selected, '13:00', '18:00'),
        ).toBe(false)
        expect(
            calendarValueHasTimeWithinBounds(
                [new Date(2026, 8, 10, 13), new Date(2026, 8, 11, 19)],
                '13:00',
                '18:00',
            ),
        ).toBe(false)
        expect(
            calendarValueHasTimeWithinBounds(
                [new Date(2026, 8, 10, 13), new Date(2026, 8, 11, 18, 0, 59)],
                '13:00',
                '18:00',
            ),
        ).toBe(true)
        expect(
            calendarValueHasTimeWithinBounds(
                [selected, null],
                '13:00',
                '18:00',
            ),
        ).toBe(false)
    })

    test('rejects invalid complete times before Date can normalize them', () => {
        const selected = new Date(2026, 8, 30, 19, 0)

        expect(updateCalendarTime(selected, '2900')).toBeUndefined()
        expect(updateCalendarTime(selected, '2400')).toBeUndefined()
        expect(updateCalendarTime(selected, '1260')).toBeUndefined()

        const valid = updateCalendarTime(selected, '2000')
        expect(valid?.date.getFullYear()).toBe(2026)
        expect(valid?.date.getMonth()).toBe(8)
        expect(valid?.date.getDate()).toBe(30)
        expect(valid?.date.getHours()).toBe(20)
        expect(valid?.time).toBe('2000')
    })

    test('does not create a date when a time is entered without a date', () => {
        expect(updateCalendarTime(null, '1234')).toBeUndefined()
    })

    test('clamps a changed range endpoint so callbacks stay chronological', () => {
        const start = new Date(2026, 8, 30, 19, 0)
        const end = new Date(2026, 8, 30, 23, 59)
        const requestedEarlierEnd = updateCalendarTime(end, '1800')!.date
        const nextRange = updateCalendarRangeBoundary(
            [start, end],
            1,
            requestedEarlierEnd,
        )

        expect(nextRange[1]).toEqual(start)
        expect(nextRange[0]!.getTime()).toBeLessThanOrEqual(
            nextRange[1]!.getTime(),
        )
    })

    test('still applies valid minimum and maximum time constraints', () => {
        const selected = new Date(2026, 8, 30, 12, 30)

        expect(
            updateCalendarTime(selected, '0800', '09:00', '17:00')?.time,
        ).toBe('0900')
        expect(
            updateCalendarTime(selected, '1800', '09:00', '17:00')?.time,
        ).toBe('1700')
    })

    test('handles the missing spring clock-change hour within time bounds', () => {
        withTimeZone('Europe/Berlin', () => {
            const springForward = new Date(2026, 2, 29)

            expect(updateCalendarTime(springForward, '0230')).toBeUndefined()
            expect(
                updateCalendarTime(springForward, '0230', '01:30', '04:00'),
            ).toBeUndefined()

            const clampedToMaximum = updateCalendarTime(
                springForward,
                '0330',
                undefined,
                '02:30',
            )
            expect(clampedToMaximum?.time).toBe('0159')
            expect(clampedToMaximum?.date.getHours()).toBe(1)
            expect(clampedToMaximum?.date.getMinutes()).toBe(59)

            const clampedToMinimum = updateCalendarTime(
                springForward,
                '0130',
                '02:30',
            )
            expect(clampedToMinimum?.time).toBe('0300')
            expect(clampedToMinimum?.date.getHours()).toBe(3)
            expect(clampedToMinimum?.date.getMinutes()).toBe(0)
        })
    })

    test('rejects dates whose entire configured time interval is missing', () => {
        withTimeZone('Europe/Berlin', () => {
            const springForward = new Date(2026, 2, 29)

            expect(
                hasCalendarTimeWithinBounds(springForward, '02:30', '02:45'),
            ).toBe(false)
            expect(
                updateCalendarTime(springForward, '0130', '02:30', '02:45'),
            ).toBeUndefined()
            expect(
                constrainCalendarTime(springForward, '02:30', '02:45'),
            ).toBeUndefined()
        })
    })

    test('keeps the earlier repeated autumn minute representable', () => {
        withTimeZone('Europe/Berlin', () => {
            const fallBack = new Date(2026, 9, 25, 3, 30)
            const update = updateCalendarTime(fallBack, '0230')

            expect(update?.time).toBe('0230')
            expect(update?.date.getHours()).toBe(2)
            expect(update?.date.getMinutes()).toBe(30)
            expect(update?.date.getTimezoneOffset()).toBe(-120)
        })
    })
})
