import { describe, expect, test } from 'bun:test'
import { updateCalendarRangeBoundary } from '../Tools/CalendarSelection.js'
import { updateCalendarTime } from '../Tools/CalendarTime.js'

describe('calendar time edits', () => {
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
})
