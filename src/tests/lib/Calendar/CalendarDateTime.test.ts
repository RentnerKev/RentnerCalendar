import { expect, test } from 'bun:test'
import {
    calendarValueWithinDateTimeBounds,
    constrainCalendarDateTime,
} from '../../../lib/Calendar/CalendarDateTime.ts'

const date = (day: number, hour: number, minute = 0, second = 0) =>
    new Date(2026, 9, day, hour, minute, second)
test('intersects instant bounds with daily time limits without changing the local day', () => {
    const min = date(16, 12, 30, 15)
    const max = date(18, 14)
    expect(constrainCalendarDateTime(date(15, 13), min, max)).toBeUndefined()
    expect(
        constrainCalendarDateTime(date(16, 9), min, max, '08:00', '17:00'),
    ).toEqual(min)
    expect(
        constrainCalendarDateTime(date(17, 9), min, max, '08:00', '17:00'),
    ).toEqual(date(17, 9))
    expect(
        constrainCalendarDateTime(date(18, 16), min, max, '08:00', '17:00'),
    ).toEqual(max)
    expect(
        constrainCalendarDateTime(date(16, 9), min, max, '08:00', '12:00'),
    ).toBeUndefined()
})
test('validates both endpoints and rejects contradictory instant bounds', () => {
    const min = date(16, 12)
    const max = date(18, 14)
    expect(calendarValueWithinDateTimeBounds([min, max], min, max)).toBe(true)
    expect(
        calendarValueWithinDateTimeBounds([date(16, 11), max], min, max),
    ).toBe(false)
    expect(
        calendarValueWithinDateTimeBounds([min, date(18, 15)], min, max),
    ).toBe(false)
    expect(calendarValueWithinDateTimeBounds([min, null], min, max)).toBe(true)
    expect(calendarValueWithinDateTimeBounds(undefined, max, min)).toBe(false)
})
