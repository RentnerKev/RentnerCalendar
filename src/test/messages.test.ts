import { describe, expect, test } from 'bun:test'
import { calendarMessageCatalog, resolveCalendarMessages } from '../messages.js'
import {
    formatCalendarValue,
    formatMonthName,
} from '../Tools/FormatFunctions.js'

describe('calendar messages', () => {
    test('keeps German defaults', () => {
        const messages = resolveCalendarMessages()

        expect(messages.required).toBe('Dieses Feld ist erforderlich')
        expect(messages.apply).toBe('Anwenden')
        expect(messages.weekdays).toEqual([
            'Mo',
            'Di',
            'Mi',
            'Do',
            'Fr',
            'Sa',
            'So',
        ])
        expect(messages.months[2]).toBe('März')
    })

    test('provides complete English defaults', () => {
        const messages = resolveCalendarMessages('en')

        expect(messages).toMatchObject({
            required: 'This field is required',
            apply: 'Apply',
            previousMonth: 'Previous month',
            searchPlaceholder: 'Search…',
            day: 'Day',
            range: 'Range',
            from: 'From',
            to: 'To',
            time: 'Time',
        })
        expect(messages.weekdays).toEqual([
            'Mon',
            'Tue',
            'Wed',
            'Thu',
            'Fri',
            'Sat',
            'Sun',
        ])
        expect(messages.months[2]).toBe('March')
        expect(messages.holidayNames.Neujahr).toBe("New Year's Day")
    })

    test('applies partial overrides without losing defaults', () => {
        const messages = resolveCalendarMessages('en', {
            apply: 'Save',
            required: 'Choose a date',
            holidayNames: { Neujahr: 'First day' },
        })

        expect(messages.apply).toBe('Save')
        expect(messages.required).toBe('Choose a date')
        expect(messages.noOptions).toBe(calendarMessageCatalog.en.noOptions)
        expect(messages.holidayNames.Neujahr).toBe('First day')
        expect(messages.holidayNames['Tag der Arbeit']).toBe('Labour Day')
    })

    test('formats public date helpers with the selected locale', () => {
        const date = new Date(2026, 2, 1)

        expect(formatCalendarValue(date)).toBe('01.03.2026')
        expect(formatCalendarValue(date, 'en')).toBe('03/01/2026')
        expect(formatMonthName(date)).toBe('März 2026')
        expect(formatMonthName(date, 'en')).toBe('March 2026')
    })
})
