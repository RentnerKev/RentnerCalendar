import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import {
    isCalendarRange,
    parseCalendarISODate,
    parseCalendarISOString,
    parseCalendarValue,
    RangeCalendar,
    serializeCalendarISODate,
    serializeCalendarISOString,
    serializeCalendarValue,
    SingleCalendar,
} from '../index.js'

describe('calendar value parsing', () => {
    test('parses ISO date-only values as strict local calendar dates', () => {
        const value = parseCalendarISODate('2026-09-21')

        expect(value?.getFullYear()).toBe(2026)
        expect(value?.getMonth()).toBe(8)
        expect(value?.getDate()).toBe(21)
        expect(value?.getHours()).toBe(0)
        expect(parseCalendarISODate('2026-02-29')).toBeUndefined()
        expect(parseCalendarISODate('2024-02-29')).toBeInstanceOf(Date)
        expect(parseCalendarISODate('2026-13-01')).toBeUndefined()
    })

    test('parses strict ISO instants and rejects normalized invalid dates', () => {
        expect(
            parseCalendarISOString('2026-09-21T14:30:00+02:00')?.toISOString(),
        ).toBe('2026-09-21T12:30:00.000Z')
        expect(
            parseCalendarISOString('2026-09-21T12:30:00.000Z')?.toISOString(),
        ).toBe('2026-09-21T12:30:00.000Z')
        expect(
            parseCalendarISOString('2026-02-31T12:30:00.000Z'),
        ).toBeUndefined()
        expect(parseCalendarISOString('21.09.2026')).toBeUndefined()
    })

    test('parses supported single inputs without sharing mutable dates', () => {
        const original = new Date(2026, 8, 21, 14, 30)
        const cloned = parseCalendarValue(original)
        const epoch = parseCalendarValue(0)
        const german = parseCalendarValue('21.09.2026 14:30')

        expect(cloned).toEqual(original)
        expect(cloned).not.toBe(original)
        expect(epoch?.getTime()).toBe(0)
        expect(german?.getFullYear()).toBe(2026)
        expect(german?.getMonth()).toBe(8)
        expect(german?.getDate()).toBe(21)
        expect(german?.getHours()).toBe(14)
        expect(german?.getMinutes()).toBe(30)
        expect(parseCalendarValue('31.02.2026')).toBeUndefined()
        expect(parseCalendarValue(new Date(Number.NaN))).toBeUndefined()
    })

    test('preserves range shape and turns invalid boundaries into null', () => {
        const range = parseCalendarValue(['2026-09-21', 'not-a-date'] as const)
        const emptyRange = parseCalendarValue([null, null] as const)

        expect(isCalendarRange(range)).toBe(true)
        expect(range?.[0]?.getFullYear()).toBe(2026)
        expect(range?.[0]?.getMonth()).toBe(8)
        expect(range?.[0]?.getDate()).toBe(21)
        expect(range?.[1]).toBeNull()
        expect(emptyRange).toEqual([null, null])
        expect(isCalendarRange(emptyRange)).toBe(true)
        expect(isCalendarRange(new Date())).toBe(false)
        expect(isCalendarRange(undefined)).toBe(false)
        expect(isCalendarRange([new Date(Number.NaN), null])).toBe(false)
        expect(parseCalendarValue([])).toBeUndefined()
        expect(parseCalendarValue([new Date()])).toBeUndefined()
    })
})

describe('calendar value serialization', () => {
    test('serializes instants and local date-only values explicitly', () => {
        const value = new Date('2026-09-21T12:30:00.000Z')
        const localValue = new Date(2026, 8, 21, 23, 45)

        expect(serializeCalendarISOString(value)).toBe(
            '2026-09-21T12:30:00.000Z',
        )
        expect(serializeCalendarISODate(localValue)).toBe('2026-09-21')
        expect(serializeCalendarValue(value)).toBe('2026-09-21T12:30:00.000Z')
        expect(serializeCalendarValue(localValue, { format: 'date' })).toBe(
            '2026-09-21',
        )
    })

    test('keeps complete, partial and empty range shapes', () => {
        const start = new Date('2026-09-21T12:30:00.000Z')
        const end = new Date('2026-09-22T15:45:00.000Z')

        expect(serializeCalendarValue([start, end])).toEqual([
            '2026-09-21T12:30:00.000Z',
            '2026-09-22T15:45:00.000Z',
        ])
        expect(serializeCalendarValue([start, null])).toEqual([
            '2026-09-21T12:30:00.000Z',
            null,
        ])
        expect(serializeCalendarValue([null, null])).toEqual([null, null])
    })

    test('never throws for invalid dates', () => {
        const invalidDate = new Date(Number.NaN)

        expect(() => serializeCalendarValue(invalidDate)).not.toThrow()
        expect(serializeCalendarValue(invalidDate)).toBeUndefined()
        expect(serializeCalendarValue([invalidDate, null])).toEqual([
            null,
            null,
        ])
    })
})

describe('typed calendar variants', () => {
    test('render single and range inputs through separate APIs', () => {
        const singleMarkup = renderToStaticMarkup(
            <SingleCalendar value="2026-09-21" />,
        )
        const rangeMarkup = renderToStaticMarkup(
            <RangeCalendar value={['2026-09-21', null]} />,
        )

        expect(singleMarkup).toContain('21.09.2026')
        expect(rangeMarkup).toContain('21.09.2026 - ?')
    })
})
