import type { CalendarGridLogicResult } from '../Types/CalendarGridLogicResult.types.ts'
import { getCalendarDateFormatters } from '../../../lib/Calendar/CalendarDateFormat.ts'
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.ts'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.ts'
import {
    compareCalendarDays,
    getCalendarDateKey,
    isCalendarDayWithinBounds,
} from '../../../lib/Calendar/CalendarDay.ts'
import { hasCalendarTimeWithinBounds } from '../../../lib/Calendar/CalendarTime.ts'
import {
    getGermanHolidayName,
    isSameDay,
    isToday,
} from '../../../lib/Calendar/date.ts'
import useCalendarGridNavigation from './useCalendarGridNavigation.ts'

function formatLongWeekday(formatter: Intl.DateTimeFormat, isoDay: number) {
    const date = new Date(2023, 0, 2 + isoDay - 1)
    return formatter.format(date)
}

import type { CalendarGridInternalProps } from '../Types/CalendarGrid.types.ts'
export default function useCalendarGridLogic({
    handleGetDaysInMonth,
    selectedDate,
    onSelectDate,
    enableRange,
    enableTime,
    customDesign = defaultCalendarDesign,
    minDate,
    maxDate,
    minTime,
    maxTime,
    visibleDays = 7,
    weekStartsOn = 1,
    showHolidays = false,
    locale = 'de',
    messages: providedMessages,
    disabled = false,
    readOnly = false,
    currentDate,
    onViewDateChange,
}: CalendarGridInternalProps): CalendarGridLogicResult {
    const dateFormatters = getCalendarDateFormatters(locale)
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const messages = providedMessages ?? resolveCalendarMessages(locale)
    const isInteractionDisabled = disabled || readOnly
    const dayItems = handleGetDaysInMonth()
    const isDateDisabled = (date: Date) =>
        isInteractionDisabled ||
        !isCalendarDayWithinBounds(date, minDate, maxDate) ||
        (enableTime && !hasCalendarTimeWithinBounds(date, minTime, maxTime))
    const availabilityKey = [
        minDate ? getCalendarDateKey(minDate) : '',
        maxDate ? getCalendarDateKey(maxDate) : '',
        enableTime ? (minTime ?? '') : '',
        enableTime ? (maxTime ?? '') : '',
    ].join('|')

    let preferredDate: Date | undefined
    if (Array.isArray(selectedDate)) {
        preferredDate = selectedDate[0] ?? selectedDate[1] ?? undefined
    } else if (selectedDate instanceof Date) {
        preferredDate = selectedDate
    }

    const initialFocusDate =
        dayItems.find(
            ({ date }) =>
                preferredDate &&
                isSameDay(date, preferredDate) &&
                !isDateDisabled(date),
        )?.date ??
        dayItems.find(({ date }) => isToday(date) && !isDateDisabled(date))
            ?.date ??
        dayItems.find(({ date }) => !isDateDisabled(date))?.date

    const {
        refs: { gridRef },
        state,
        handler,
    } = useCalendarGridNavigation({
        columnCount: visibleDays,
        weekStartsOn,
        currentDate,
        initialFocusDate,
        minDate,
        maxDate,
        availabilityKey,
        isDateSelectable: (date) => !isDateDisabled(date),
        onViewDateChange,
    })

    const hasActiveDate = dayItems.some(
        ({ date }) =>
            getCalendarDateKey(date) === state.activeDateKey &&
            !isDateDisabled(date),
    )
    const activeDateKey = hasActiveDate
        ? state.activeDateKey
        : initialFocusDate
          ? getCalendarDateKey(initialFocusDate)
          : ''

    const weekDays = Array.from({ length: visibleDays }, (_, index) => {
        const isoDay = ((weekStartsOn - 1 + index) % 7) + 1
        return {
            shortName: messages.weekdays[isoDay - 1],
            fullName: formatLongWeekday(dateFormatters.weekday, isoDay),
        }
    })
    const rawRows = Array.from(
        { length: Math.ceil(dayItems.length / visibleDays) },
        (_, rowIndex) =>
            dayItems.slice(
                rowIndex * visibleDays,
                (rowIndex + 1) * visibleDays,
            ),
    )

    const rows = rawRows.map((week) =>
        week.map((dayObj) => {
            const dateKey = getCalendarDateKey(dayObj.date)
            let isSelected = false
            let isInRange = false
            let rangeMembership: string | undefined

            const germanHolidayName = showHolidays
                ? getGermanHolidayName(dayObj.date)
                : null
            const holidayName = germanHolidayName
                ? (messages.holidayNames[
                      germanHolidayName as keyof typeof messages.holidayNames
                  ] ?? germanHolidayName)
                : null
            const dayDisabled = isDateDisabled(dayObj.date)

            if (enableRange && Array.isArray(selectedDate)) {
                const [start, end] = selectedDate
                if (start && isSameDay(dayObj.date, start)) {
                    isSelected = true
                    rangeMembership =
                        end && isSameDay(dayObj.date, end)
                            ? locale === 'en'
                                ? 'start and end of selected range'
                                : 'Anfang und Ende des ausgewählten Zeitraums'
                            : locale === 'en'
                              ? 'start of selected range'
                              : 'Beginn des ausgewählten Zeitraums'
                }
                if (end && isSameDay(dayObj.date, end)) {
                    isSelected = true
                    rangeMembership ??=
                        locale === 'en'
                            ? 'end of selected range'
                            : 'Ende des ausgewählten Zeitraums'
                }
                if (
                    start &&
                    end &&
                    compareCalendarDays(dayObj.date, start) > 0 &&
                    compareCalendarDays(dayObj.date, end) < 0
                ) {
                    isInRange = true
                    rangeMembership =
                        locale === 'en'
                            ? 'within selected range'
                            : 'im ausgewählten Zeitraum'
                }
            } else if (!enableRange && selectedDate instanceof Date) {
                isSelected = isSameDay(dayObj.date, selectedDate)
            }

            const isCurrentDay = isToday(dayObj.date)
            let buttonClass =
                'h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 '

            if (dayDisabled) {
                buttonClass += `opacity-30 cursor-not-allowed ${cd.textDisabled} `
            } else {
                buttonClass += 'cursor-pointer '
                if (isSelected) {
                    buttonClass += `${cd.primaryBg} ${cd.textBackground} font-bold `
                } else if (isInRange) {
                    buttonClass += `${cd.primaryBgSubtle} ${cd.textColor} `
                } else if (!dayObj.isCurrentMonth) {
                    buttonClass += `${cd.textDisabled} ${cd.hoverTextMuted} `
                } else {
                    buttonClass += `${cd.textDay} ${cd.hoverBackground} ${cd.hoverText} `
                }
            }

            if (isCurrentDay && !isSelected && !isInRange && !dayDisabled) {
                buttonClass += `border ${cd.primaryBorder} ${cd.primaryColor} `
            } else if (isCurrentDay && dayDisabled) {
                buttonClass += `border ${cd.borderColor} `
            }

            const dateLabel = dateFormatters.full.format(dayObj.date)
            return {
                date: dayObj.date,
                dateKey,
                isSelected,
                isInRange,
                holidayName,
                dayDisabled,
                isCurrentDay,
                buttonClass,
                dateLabel,
                rangeMembership,
            }
        }),
    )
    function handleSelectDate(date: Date) {
        if (!isDateDisabled(date)) onSelectDate(date)
    }
    return {
        state: { cd, messages, rows, weekDays, activeDateKey },
        handler: {
            handleDayFocus: handler.handleDayFocus,
            handleDayKeyDown: handler.handleDayKeyDown,
            handleSelectDate,
        },
        refs: { gridRef },
    }
}
