import { createRef } from 'react'
import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import CalendarPopover from '../../../../shared/Calendar/Components/CalendarPopover.tsx'
import { getCalendarMonthDays } from '../../../../lib/Calendar/CalendarDay.ts'
import { defaultCalendarDesign } from '../../../../config/calendarDesign.config.ts'
import { resolveCalendarMessages } from '../../../../lib/Calendar/messages.ts'

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

function renderPopover(
    selectedDate: [Date | null, Date | null],
    minTime = '02:30',
    maxTime = '02:45',
) {
    const currentDate = new Date(2026, 2, 1)

    return renderToStaticMarkup(
        <CalendarPopover
            backdrop={false}
            onClose={() => undefined}
            dialogId="calendar-dialog"
            popoverRef={createRef<HTMLDivElement>()}
            className=""
            style={{}}
            dialogLabel="Open calendar"
            switchMode={false}
            isRangeMode
            onRangeModeChange={() => undefined}
            disabled={false}
            readOnly={false}
            messages={resolveCalendarMessages('en')}
            currentDate={currentDate}
            onPrevMonth={() => undefined}
            onNextMonth={() => undefined}
            onViewDateChange={() => undefined}
            fastEdit={false}
            customDesign={defaultCalendarDesign}
            getDaysInMonth={() => getCalendarMonthDays(2026, 2, 1, 7)}
            selectedDate={selectedDate}
            onSelectDate={() => undefined}
            weekStartsOn={1}
            visibleDays={7}
            showHolidays={false}
            locale="en"
            enableTime
            onTimeChange={() => undefined}
            minTime={minTime}
            maxTime={maxTime}
            button
            onApply={() => undefined}
        />,
    )
}

describe('calendar apply availability', () => {
    test('disables Apply when a selected endpoint has no allowed local minute', () => {
        withTimeZone('Europe/Berlin', () => {
            const markup = renderPopover([new Date(2026, 2, 29), null])

            expect(markup).toMatch(
                /<button\b(?=[^>]*disabled="")[^>]*>Apply<\/button>/,
            )
        })
    })

    test('keeps Apply enabled for endpoints selected within the time bounds', () => {
        withTimeZone('Europe/Berlin', () => {
            const markup = renderPopover([new Date(2026, 2, 28, 2, 30), null])

            expect(markup).toMatch(
                /<button\b(?![^>]*disabled="")[^>]*>Apply<\/button>/,
            )
        })
    })

    test('disables Apply when tightened bounds exclude the selected time', () => {
        const markup = renderPopover(
            [new Date(2026, 8, 10, 12), null],
            '13:00',
            '18:00',
        )

        expect(markup).toMatch(
            /<button\b(?=[^>]*disabled="")[^>]*>Apply<\/button>/,
        )
    })
})
