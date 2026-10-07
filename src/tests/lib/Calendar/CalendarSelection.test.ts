import { describe, expect, test } from 'bun:test'
import { createCalendarDateSelection } from '../../../lib/Calendar/CalendarSelection.js'

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

describe('calendar date selections with bounds', () => {
    test('clamps new and preserved single-date times to the configured bounds', () => {
        const date = new Date(2026, 8, 10)
        const emptySelection = createCalendarDateSelection(date, undefined, {
            enableTime: true,
            minTime: '08:00',
            maxTime: '18:00',
        })
        const preservedSelection = createCalendarDateSelection(
            date,
            new Date(2026, 8, 9, 22, 30),
            { enableTime: true, minTime: '08:00', maxTime: '18:00' },
        )

        expect(emptySelection).toBeInstanceOf(Date)
        expect((emptySelection as Date).getHours()).toBe(8)
        expect((emptySelection as Date).getMinutes()).toBe(0)
        expect(preservedSelection).toBeInstanceOf(Date)
        expect((preservedSelection as Date).getHours()).toBe(18)
        expect((preservedSelection as Date).getMinutes()).toBe(0)
    })

    test('clamps both new range endpoints, including the default end of day', () => {
        const options = {
            enableRange: true,
            enableTime: true,
            minTime: '08:00',
            maxTime: '18:00',
        }
        const partialRange = createCalendarDateSelection(
            new Date(2026, 8, 10),
            undefined,
            options,
        )
        const completeRange = createCalendarDateSelection(
            new Date(2026, 8, 12),
            partialRange,
            options,
        )

        expect(Array.isArray(partialRange)).toBe(true)
        if (!Array.isArray(partialRange) || !Array.isArray(completeRange)) {
            throw new Error('Expected a range selection')
        }
        expect(partialRange[0]?.getHours()).toBe(8)
        expect(completeRange[0]?.getDate()).toBe(10)
        expect(completeRange[0]?.getHours()).toBe(8)
        expect(completeRange[1]?.getDate()).toBe(12)
        expect(completeRange[1]?.getHours()).toBe(18)
        expect(completeRange[1]?.getMinutes()).toBe(0)
    })

    test('restarts a partial range when its start is outside the date bounds', () => {
        const selection = createCalendarDateSelection(
            new Date(2026, 8, 12),
            [new Date(2026, 8, 1, 14), null],
            {
                enableRange: true,
                enableTime: true,
                minDate: new Date(2026, 8, 10),
                maxDate: new Date(2026, 8, 20),
                minTime: '08:00',
                maxTime: '18:00',
            },
        )

        expect(Array.isArray(selection)).toBe(true)
        if (!Array.isArray(selection)) throw new Error('Expected a range')
        expect(selection[0]?.getDate()).toBe(12)
        expect(selection[0]?.getHours()).toBe(8)
        expect(selection[1]).toBeNull()
    })

    test('clamps an existing partial range start before completing the range', () => {
        const selection = createCalendarDateSelection(
            new Date(2026, 8, 12),
            [new Date(2026, 8, 10, 22, 30), null],
            {
                enableRange: true,
                enableTime: true,
                minTime: '08:00',
                maxTime: '18:00',
            },
        )

        expect(Array.isArray(selection)).toBe(true)
        if (!Array.isArray(selection)) throw new Error('Expected a range')
        expect(selection[0]?.getHours()).toBe(18)
        expect(selection[1]?.getHours()).toBe(18)
    })

    test('moves a carried spring-gap time to the nearest allowed minute', () => {
        withTimeZone('Europe/Berlin', () => {
            const currentValue = new Date(2026, 2, 28, 2, 30)
            const selection = createCalendarDateSelection(
                new Date(2026, 2, 29),
                currentValue,
                { enableTime: true },
            )

            expect(selection).toBeInstanceOf(Date)
            expect((selection as Date).getDate()).toBe(29)
            expect((selection as Date).getHours()).toBe(3)
            expect((selection as Date).getMinutes()).toBe(0)

            const maximumClamped = createCalendarDateSelection(
                new Date(2026, 2, 29),
                currentValue,
                { enableTime: true, maxTime: '02:30' },
            )
            expect((maximumClamped as Date).getHours()).toBe(1)
            expect((maximumClamped as Date).getMinutes()).toBe(59)
        })
    })

    test('keeps a backward time range chronological after DST bound clamping', () => {
        withTimeZone('Europe/Berlin', () => {
            const options = {
                enableRange: true,
                enableTime: true,
                minTime: '02:30',
                maxTime: '03:30',
            }
            const partialRange = createCalendarDateSelection(
                new Date(2026, 2, 30),
                undefined,
                options,
            )
            const completeRange = createCalendarDateSelection(
                new Date(2026, 2, 29),
                partialRange,
                options,
            )

            expect(Array.isArray(completeRange)).toBe(true)
            if (!Array.isArray(completeRange)) {
                throw new Error('Expected a range')
            }
            expect(completeRange[0]?.getDate()).toBe(29)
            expect(completeRange[0]?.getHours()).toBe(3)
            expect(completeRange[0]?.getMinutes()).toBe(30)
            expect(completeRange[1]?.getDate()).toBe(30)
            expect(completeRange[1]?.getHours()).toBe(2)
            expect(completeRange[1]?.getMinutes()).toBe(30)
            expect(completeRange[0]!.getTime()).toBeLessThanOrEqual(
                completeRange[1]!.getTime(),
            )
        })
    })

    test('starts on the first representable minute after a midnight gap', () => {
        withTimeZone('America/Sao_Paulo', () => {
            const midnightGapDate = new Date(2018, 10, 4)
            const selection = createCalendarDateSelection(
                midnightGapDate,
                undefined,
                {
                    enableTime: true,
                    minTime: '00:30',
                    maxTime: '02:00',
                },
            )

            expect(midnightGapDate.getDate()).toBe(4)
            expect(midnightGapDate.getHours()).toBe(1)
            expect(selection).toBeInstanceOf(Date)
            expect((selection as Date).getHours()).toBe(1)
            expect((selection as Date).getMinutes()).toBe(0)

            expect(
                createCalendarDateSelection(midnightGapDate, undefined, {
                    enableTime: true,
                    minTime: '00:30',
                    maxTime: '00:45',
                }),
            ).toBeUndefined()
        })
    })

    test('preserves the existing value when a clicked day has no allowed minute', () => {
        withTimeZone('Europe/Berlin', () => {
            const currentValue = new Date(2026, 2, 28, 2, 30)
            const noSlotDate = new Date(2026, 2, 29)

            expect(
                createCalendarDateSelection(noSlotDate, currentValue, {
                    enableTime: true,
                    minTime: '02:30',
                    maxTime: '02:45',
                }),
            ).toBe(currentValue)
        })
    })
})
