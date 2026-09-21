import { describe, expect, mock, test } from 'bun:test'
import {
    commitCalendarSelection,
    shouldCloseCalendarAfterSelection,
} from '../Tools/CalendarCommit.js'

describe('calendar selection commits', () => {
    test.each([
        { backdrop: true, closeOnSelect: false },
        { backdrop: false, closeOnSelect: false },
        { backdrop: true, closeOnSelect: true },
        { backdrop: false, closeOnSelect: true },
    ])(
        'commits exactly once with backdrop=$backdrop and closeOnSelect=$closeOnSelect',
        ({ backdrop, closeOnSelect }) => {
            const onChange = mock(() => undefined)
            const value = new Date(2026, 8, 21)

            commitCalendarSelection(value, onChange, {
                backdrop,
                button: false,
                closeOnSelect,
            })

            expect(onChange).toHaveBeenCalledTimes(1)
            expect(onChange).toHaveBeenCalledWith(value)
        },
    )

    test.each([false, true])(
        'defers the commit while the apply button is enabled and closeOnSelect=$closeOnSelect',
        (closeOnSelect) => {
            const onChange = mock(() => undefined)

            commitCalendarSelection(new Date(2026, 8, 21), onChange, {
                backdrop: true,
                button: true,
                closeOnSelect,
            })

            expect(onChange).not.toHaveBeenCalled()
            expect(
                shouldCloseCalendarAfterSelection(new Date(2026, 8, 21), {
                    button: true,
                    closeOnSelect,
                    isRangeMode: false,
                    source: 'date',
                }),
            ).toBe(false)
        },
    )

    test('closes after an immediate single-date selection', () => {
        expect(
            shouldCloseCalendarAfterSelection(new Date(2026, 8, 21), {
                button: false,
                closeOnSelect: true,
                isRangeMode: false,
                source: 'date',
            }),
        ).toBe(true)
    })

    test('keeps an incomplete range open', () => {
        expect(
            shouldCloseCalendarAfterSelection([new Date(2026, 8, 21), null], {
                button: false,
                closeOnSelect: true,
                isRangeMode: true,
                source: 'date',
            }),
        ).toBe(false)
    })
})
