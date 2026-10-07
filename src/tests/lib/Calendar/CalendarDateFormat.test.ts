import { expect, test } from 'bun:test'
import { getCalendarDateFormatters } from '../../../lib/Calendar/CalendarDateFormat.js'

test('cached calendar formats exactly match native labels across locales and DST dates', () => {
    for (const locale of ['de', 'en'] as const) {
        const intlLocale = locale === 'en' ? 'en-US' : 'de-DE'
        const formats = getCalendarDateFormatters(locale)
        expect(getCalendarDateFormatters(locale)).toBe(formats)
        for (const date of [
            new Date(2026, 2, 29, 1, 30),
            new Date(2026, 9, 25, 2, 30),
            new Date(2026, 11, 31, 23, 59),
        ]) {
            expect(formats.full.format(date)).toBe(
                date.toLocaleDateString(intlLocale, { dateStyle: 'full' }),
            )
            expect(formats.weekday.format(date)).toBe(
                date.toLocaleDateString(intlLocale, { weekday: 'long' }),
            )
            expect(formats.date.format(date)).toBe(
                date.toLocaleDateString(intlLocale, {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                }),
            )
            expect(formats.time.format(date)).toBe(
                date.toLocaleTimeString(intlLocale, {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            )
        }
    }
})
