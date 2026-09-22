import { defaultCalendarDesign } from '../types.js'
import { CustomTooltip } from '@rentnerkev/tooltips'
import type { CalendarGridProps } from '../types.js'
import { resolveCalendarMessages } from '../messages.js'
import {
    getGermanHolidayName,
    isSameDay,
    isToday,
} from '../Tools/InternalOnlyFunctions.js'
import useCalendarGridNavigation from '../Hooks/useCalendarGridNavigation.js'

export default function CalendarGrid({
    handleGetDaysInMonth,
    selectedDate,
    onSelectDate,
    enableRange,
    customDesign = defaultCalendarDesign,
    minDate,
    maxDate,
    visibleDays = 7,
    weekStartsOn = 1,
    showHolidays = false,
    locale = 'de',
    messages: providedMessages,
    disabled = false,
    readOnly = false,
}: CalendarGridProps) {
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const messages = providedMessages ?? resolveCalendarMessages(locale)
    const isInteractionDisabled = disabled || readOnly
    const { handler: navigationHandler } =
        useCalendarGridNavigation(visibleDays)

    const allDays = messages.weekdays
    const weekDays = []
    for (let i = 0; i < visibleDays; i++) {
        weekDays.push(allDays[(weekStartsOn - 1 + i) % 7])
    }

    return (
        <div className="w-full overflow-hidden">
            <div
                className="grid gap-1 mb-2"
                style={{
                    gridTemplateColumns: `repeat(${visibleDays}, minmax(0, 1fr))`,
                }}
            >
                {weekDays.map(function (day) {
                    return (
                        <div
                            key={day}
                            className={`text-center text-[11px] font-bold ${cd.textMutedDark} uppercase tracking-wider py-1`}
                        >
                            {day}
                        </div>
                    )
                })}
            </div>
            <div
                data-calendar-grid=""
                className="grid gap-1"
                style={{
                    gridTemplateColumns: `repeat(${visibleDays}, minmax(0, 1fr))`,
                }}
            >
                {handleGetDaysInMonth().map(function (dayObj, dayIndex) {
                    let isSelected = false
                    let isInRange = false

                    const germanHolidayName = showHolidays
                        ? getGermanHolidayName(dayObj.date)
                        : null
                    const holidayName = germanHolidayName
                        ? (messages.holidayNames[
                              germanHolidayName as keyof typeof messages.holidayNames
                          ] ?? germanHolidayName)
                        : null
                    const isBeforeMin = minDate
                        ? new Date(dayObj.date).setHours(0, 0, 0, 0) <
                          new Date(minDate).setHours(0, 0, 0, 0)
                        : false
                    const isAfterMax = maxDate
                        ? new Date(dayObj.date).setHours(23, 59, 59, 999) >
                          new Date(maxDate).setHours(23, 59, 59, 999)
                        : false
                    const isDisabled =
                        isBeforeMin || isAfterMax || isInteractionDisabled

                    if (enableRange && Array.isArray(selectedDate)) {
                        const [start, end] = selectedDate
                        if (start && isSameDay(dayObj.date, start))
                            isSelected = true
                        if (end && isSameDay(dayObj.date, end))
                            isSelected = true
                        if (
                            start &&
                            end &&
                            dayObj.date > start &&
                            dayObj.date < end
                        )
                            isInRange = true
                    } else if (!enableRange && selectedDate instanceof Date) {
                        isSelected = isSameDay(dayObj.date, selectedDate)
                    }

                    const isCurrentDay = isToday(dayObj.date)

                    let buttonClass =
                        'h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 '

                    if (isDisabled) {
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
                        !isDisabled
                    ) {
                        buttonClass += `border ${cd.primaryBorder} ${cd.primaryColor} `
                    } else if (isCurrentDay && isDisabled) {
                        buttonClass += `border ${cd.borderColor} `
                    }

                    if (holidayName) {
                        const dateLabel = dayObj.date.toLocaleDateString(
                            locale === 'en' ? 'en-US' : 'de-DE',
                            { dateStyle: 'full' },
                        )
                        return (
                            <CustomTooltip
                                key={dayObj.date.getTime()}
                                content={holidayName}
                                side="top"
                                disabledTrigger={isDisabled}
                            >
                                <button
                                    data-calendar-day=""
                                    onClick={() =>
                                        !isDisabled && onSelectDate(dayObj.date)
                                    }
                                    onKeyDown={(event) =>
                                        navigationHandler.handleDayKeyDown(
                                            event,
                                            dayIndex,
                                        )
                                    }
                                    className={buttonClass.trim()}
                                    type="button"
                                    disabled={isDisabled}
                                    aria-label={`${messages.selectDate(dateLabel)}: ${holidayName}`}
                                    aria-pressed={isSelected}
                                    aria-current={
                                        isCurrentDay ? 'date' : undefined
                                    }
                                >
                                    {dayObj.date.getDate()}
                                    <span
                                        className={`absolute top-1 right-1 w-1.5 h-1.5 rounded-full ${cd.primaryBg}`}
                                    />
                                </button>
                            </CustomTooltip>
                        )
                    }

                    return (
                        <button
                            data-calendar-day=""
                            key={dayObj.date.getTime()}
                            onClick={function () {
                                if (!isDisabled) onSelectDate(dayObj.date)
                            }}
                            onKeyDown={(event) =>
                                navigationHandler.handleDayKeyDown(
                                    event,
                                    dayIndex,
                                )
                            }
                            className={buttonClass.trim()}
                            type="button"
                            disabled={isDisabled}
                            aria-label={messages.selectDate(
                                dayObj.date.toLocaleDateString(
                                    locale === 'en' ? 'en-US' : 'de-DE',
                                    { dateStyle: 'full' },
                                ),
                            )}
                            aria-pressed={isSelected}
                            aria-current={isCurrentDay ? 'date' : undefined}
                        >
                            {dayObj.date.getDate()}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
