import { describe, expect, test } from 'bun:test'
import { execFileSync } from 'node:child_process'
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
} from '../../../index.js'

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

    test('accepts a date with a midnight gap while keeping local datetimes strict', () => {
        const moduleUrl = new URL(
            '../../../Tools/CalendarValue.ts',
            import.meta.url,
        ).href
        const source = `
            const { parseCalendarISODate, parseCalendarDate } = await import(${JSON.stringify(moduleUrl)})
            const date = parseCalendarISODate('2018-11-04')
            console.log(JSON.stringify({
                date: date && [date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours()],
                datetimeRejected: parseCalendarDate('2018-11-04T00:30') === undefined,
            }))
        `
        const saoPauloValue = execFileSync(process.execPath, ['-e', source], {
            encoding: 'utf8',
            env: { ...process.env, TZ: 'America/Sao_Paulo' },
        })
        const apiaValue = execFileSync(
            process.execPath,
            [
                '-e',
                `
                    const { parseCalendarISODate } = await import(${JSON.stringify(moduleUrl)})
                    console.log(JSON.stringify(parseCalendarISODate('2011-12-30') === undefined))
                `,
            ],
            {
                encoding: 'utf8',
                env: { ...process.env, TZ: 'Pacific/Apia' },
            },
        )

        expect(JSON.parse(saoPauloValue)).toEqual({
            date: [2018, 11, 4, 1],
            datetimeRejected: true,
        })
        expect(JSON.parse(apiaValue)).toBe(true)
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
        expect(parseCalendarValue('2/31/2026')).toBeUndefined()
        expect(parseCalendarValue('2026-2-31')).toBeUndefined()
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

    test('orders reversed range values chronologically', () => {
        const range = parseCalendarValue(['2026-09-22', '2026-09-18'] as const)

        expect(Array.isArray(range)).toBe(true)
        if (!Array.isArray(range)) return
        expect(range[0]?.getDate()).toBe(18)
        expect(range[1]?.getDate()).toBe(22)
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
        expect(
            serializeCalendarValue(
                [new Date(2026, 8, 22), new Date(2026, 8, 18)],
                { format: 'date' },
            ),
        ).toEqual(['2026-09-18', '2026-09-22'])
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
