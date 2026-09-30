import { defaultCalendarDesign } from '../types.js'
import { CustomTooltip } from '@rentnerkev/tooltips'
import type { CalendarGridProps } from '../types.js'
import { resolveCalendarMessages } from '../messages.js'
import {
    compareCalendarDays,
    getCalendarDateKey,
    isCalendarDayWithinBounds,
} from '../Tools/CalendarDay.js'
import { hasCalendarTimeWithinBounds } from '../Tools/CalendarTime.js'
import {
    getGermanHolidayName,
    isSameDay,
    isToday,
} from '../Tools/InternalOnlyFunctions.js'
import useCalendarGridNavigation from '../Hooks/useCalendarGridNavigation.js'

interface CalendarGridInternalProps extends CalendarGridProps {
    currentDate: Date
    onViewDateChange: (date: Date) => void
    monthHeadingId: string
    keyboardHelpId: string
}

function formatLongWeekday(locale: 'de' | 'en', isoDay: number) {
    const date = new Date(2023, 0, 2 + isoDay - 1)
    return date.toLocaleDateString(locale === 'en' ? 'en-US' : 'de-DE', {
        weekday: 'long',
    })
}

export default function CalendarGrid({
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
    monthHeadingId,
    keyboardHelpId,
}: CalendarGridInternalProps) {
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const messages = providedMessages ?? resolveCalendarMessages(locale)
    const isInteractionDisabled = disabled || readOnly
    const dayItems = handleGetDaysInMonth()
    const isDateDisabled = (date: Date) =>
        isInteractionDisabled ||
        !isCalendarDayWithinBounds(date, minDate, maxDate) ||
        (enableTime && !hasCalendarTimeWithinBounds(date, minTime, maxTime))

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

    const { gridRef, state, handler } = useCalendarGridNavigation({
        columnCount: visibleDays,
        weekStartsOn,
        currentDate,
        initialFocusDate,
        minDate,
        maxDate,
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
            fullName: formatLongWeekday(locale, isoDay),
        }
    })
    const rows = Array.from(
        { length: Math.ceil(dayItems.length / visibleDays) },
        (_, rowIndex) =>
            dayItems.slice(
                rowIndex * visibleDays,
                (rowIndex + 1) * visibleDays,
            ),
    )

    return (
        <div className="w-full overflow-hidden">
            <div
                ref={gridRef}
                data-calendar-grid=""
                role="grid"
                aria-labelledby={monthHeadingId}
                aria-describedby={keyboardHelpId}
                aria-rowcount={rows.length + 1}
                aria-colcount={visibleDays}
                aria-multiselectable={enableRange || undefined}
                className="w-full"
            >
                <div role="rowgroup">
                    <div
                        role="row"
                        className="grid gap-1 mb-1"
                        style={{
                            gridTemplateColumns: `repeat(${visibleDays}, minmax(0, 1fr))`,
                        }}
                    >
                        {weekDays.map(({ shortName, fullName }) => (
                            <div
                                key={fullName}
                                role="columnheader"
                                aria-label={fullName}
                                className={`text-center text-[11px] font-bold ${cd.textMutedDark} uppercase tracking-wider py-1`}
                            >
                                {shortName}
                            </div>
                        ))}
                    </div>
                </div>
                <div role="rowgroup" className="grid gap-1">
                    {rows.map((week) => (
                        <div
                            key={`week-${getCalendarDateKey(week[0].date)}`}
                            role="row"
                            className="grid gap-1"
                            style={{
                                gridTemplateColumns: `repeat(${visibleDays}, minmax(0, 1fr))`,
                            }}
                        >
                            {week.map(function (dayObj) {
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

                                if (
                                    enableRange &&
                                    Array.isArray(selectedDate)
                                ) {
                                    const [start, end] = selectedDate
                                    if (
                                        start &&
                                        isSameDay(dayObj.date, start)
                                    ) {
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
                                        compareCalendarDays(
                                            dayObj.date,
                                            start,
                                        ) > 0 &&
                                        compareCalendarDays(dayObj.date, end) <
                                            0
                                    ) {
                                        isInRange = true
                                        rangeMembership =
                                            locale === 'en'
                                                ? 'within selected range'
                                                : 'im ausgewählten Zeitraum'
                                    }
                                } else if (
                                    !enableRange &&
                                    selectedDate instanceof Date
                                ) {
                                    isSelected = isSameDay(
                                        dayObj.date,
                                        selectedDate,
                                    )
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

                                if (
                                    isCurrentDay &&
                                    !isSelected &&
                                    !isInRange &&
                                    !dayDisabled
                                ) {
                                    buttonClass += `border ${cd.primaryBorder} ${cd.primaryColor} `
                                } else if (isCurrentDay && dayDisabled) {
                                    buttonClass += `border ${cd.borderColor} `
                                }

                                const dateLabel =
                                    dayObj.date.toLocaleDateString(
                                        locale === 'en' ? 'en-US' : 'de-DE',
                                        { dateStyle: 'full' },
                                    )
                                const dayButton = (
                                    <button
                                        key={dateKey}
                                        data-calendar-day=""
                                        data-calendar-date={dateKey}
                                        onClick={() =>
                                            !dayDisabled &&
                                            onSelectDate(dayObj.date)
                                        }
                                        onFocus={() =>
                                            handler.handleDayFocus(dayObj.date)
                                        }
                                        onKeyDown={(event) =>
                                            handler.handleDayKeyDown(
                                                event,
                                                dayObj.date,
                                            )
                                        }
                                        className={buttonClass.trim()}
                                        type="button"
                                        disabled={dayDisabled}
                                        tabIndex={
                                            !dayDisabled &&
                                            dateKey === activeDateKey
                                                ? 0
                                                : -1
                                        }
                                        aria-label={`${messages.selectDate(dateLabel)}${holidayName ? `: ${holidayName}` : ''}${rangeMembership ? `, ${rangeMembership}` : ''}`}
                                        aria-pressed={isSelected || isInRange}
                                        aria-current={
                                            isCurrentDay ? 'date' : undefined
                                        }
                                    >
                                        {dayObj.date.getDate()}
                                        {holidayName && (
                                            <span
                                                aria-hidden="true"
                                                className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${cd.primaryBg}`}
                                            />
                                        )}
                                    </button>
                                )

                                return (
                                    <div
                                        key={dateKey}
                                        role="gridcell"
                                        aria-selected={isSelected || isInRange}
                                        className="flex items-center justify-center"
                                    >
                                        {holidayName ? (
                                            <CustomTooltip
                                                key={dateKey}
                                                content={holidayName}
                                                side="top"
                                                disabledTrigger={dayDisabled}
                                            >
                                                {dayButton}
                                            </CustomTooltip>
                                        ) : (
                                            dayButton
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
