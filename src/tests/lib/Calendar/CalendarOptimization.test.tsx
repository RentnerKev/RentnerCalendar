import { expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { getCalendarDateFormatters } from '../../../lib/Calendar/CalendarDateFormat.ts'
import { getCalendarMonthDays } from '../../../lib/Calendar/CalendarDay.ts'
import { formatCalendarValue } from '../../../lib/Calendar/FormatFunctions.ts'
import CalendarGrid from '../../../shared/Calendar/Components/CalendarGrid.tsx'

test('a warm 42-day range grid reuses known dates while preserving selection and focus', () => {
    const currentDate = new Date(2026, 8, 1)
    const days = getCalendarMonthDays(2026, 8, 1, 7)
    const selectedDate: [Date, Date] = [
        new Date(2026, 8, 10, 8),
        new Date(2026, 8, 12, 18),
    ]
    const grid = (
        <CalendarGrid
            currentDate={currentDate}
            handleGetDaysInMonth={() => days}
            selectedDate={selectedDate}
            onSelectDate={() => undefined}
            enableRange
            locale="en"
        />
    )
    renderToStaticMarkup(grid)
    const originalDate = globalThis.Date
    let constructions = 0
    globalThis.Date = new Proxy(originalDate, {
        construct(target, args) {
            constructions++
            return Reflect.construct(target, args)
        },
    })
    let markup: string
    try {
        markup = renderToStaticMarkup(grid)
    } finally {
        globalThis.Date = originalDate
    }
    expect(constructions).toBeLessThanOrEqual(12)
    expect((markup.match(/data-calendar-day=""/g) ?? []).length).toBe(42)
    expect((markup.match(/tabindex="0"/g) ?? []).length).toBe(1)
    expect((markup.match(/aria-pressed="true"/g) ?? []).length).toBe(3)
    expect(markup).toContain('within selected range')
    expect(markup).toContain('start of selected range')
    expect(markup).toContain('end of selected range')
})

test('range formatting resolves the host timezone once per value, including partial ranges', () => {
    const start = new Date(2026, 8, 10, 8, 30)
    const end = new Date(2026, 8, 12, 23, 59, 59, 999)
    const formats = getCalendarDateFormatters('en')
    const expected = `${formats.date.format(start)} ${formats.time.format(start)} - ${formats.date.format(end)}`
    const originalDateTimeFormat = Intl.DateTimeFormat
    let constructions = 0
    Intl.DateTimeFormat = new Proxy(originalDateTimeFormat, {
        construct(target, args) {
            constructions++
            return Reflect.construct(target, args)
        },
    })
    try {
        for (let index = 0; index < 100; index++) {
            expect(formatCalendarValue([start, end], 'en')).toBe(expected)
        }
        expect(constructions).toBe(100)
        expect(formatCalendarValue([null, end], 'en')).toBe(
            `? - ${formats.date.format(end)}`,
        )
        expect(constructions).toBe(101)
        expect(formatCalendarValue([start, null], 'en')).toBe(
            `${formats.date.format(start)} ${formats.time.format(start)} - ?`,
        )
        expect(constructions).toBe(102)
        expect(formatCalendarValue([null, 'invalid'], 'en')).toBe('')
        expect(constructions).toBe(102)
    } finally {
        Intl.DateTimeFormat = originalDateTimeFormat
    }
})

test('formatter caching follows runtime timezone changes for both locales', () => {
    const previousTimeZone = process.env.TZ
    const date = new Date('2026-03-29T00:30:00Z')
    try {
        for (const timeZone of ['Europe/Berlin', 'America/New_York', 'UTC']) {
            process.env.TZ = timeZone
            for (const locale of ['de', 'en'] as const) {
                const intlLocale = locale === 'en' ? 'en-US' : 'de-DE'
                const expectedDate = date.toLocaleDateString(intlLocale, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                })
                const expectedTime = date.toLocaleTimeString(intlLocale, {
                    hour: '2-digit',
                    minute: '2-digit',
                })
                expect(formatCalendarValue(date, locale)).toBe(
                    `${expectedDate} ${expectedTime}`,
                )
                expect(formatCalendarValue([date, date], locale)).toBe(
                    `${expectedDate} ${expectedTime} - ${expectedDate} ${expectedTime}`,
                )
            }
        }
    } finally {
        if (previousTimeZone === undefined) delete process.env.TZ
        else process.env.TZ = previousTimeZone
    }
})
