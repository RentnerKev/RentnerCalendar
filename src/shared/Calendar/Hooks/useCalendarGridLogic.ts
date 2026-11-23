import { useCallback, useMemo } from 'react'
import {
    buildDisabledWeekdayMask,
    isCalendarDateDisabled,
} from '../../../lib/Calendar/CalendarRestrictions.ts'
import type { CalendarGridLogicResult } from '../Types/CalendarGridLogicResult.types.ts'
import { getCalendarDateFormatters } from '../../../lib/Calendar/CalendarDateFormat.ts'
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.ts'
import { resolveCalendarMessages } from '../../../lib/Calendar/messages.ts'
import {
    getCalendarDateKey,
    isCalendarDayWithinBounds,
    startOfCalendarDay,
} from '../../../lib/Calendar/CalendarDay.ts'
import { constrainCalendarDateTime } from '../../../lib/Calendar/CalendarDateTime.ts'
import { hasCalendarTimeWithinBounds } from '../../../lib/Calendar/CalendarTime.ts'
import {
    getGermanHolidayName,
    getTodayDayNumber,
} from '../../../lib/Calendar/date.ts'
import useCalendarGridNavigation from './useCalendarGridNavigation.ts'
import type { CalendarGridInternalProps } from '../Types/CalendarGrid.types.ts'

function formatLongWeekday(formatter: Intl.DateTimeFormat, isoDay: number) {
    const date = new Date(2023, 0, 2 + isoDay - 1)
    return formatter.format(date)
}

function toDayNumber(date: Date) {
    return date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate()
}

export default function useCalendarGridLogic({
    handleGetDaysInMonth,
    selectedDate,
    onSelectDate,
    enableRange,
    enableTime,
    customDesign = defaultCalendarDesign,
    minDate,
    maxDate,
    disabledWeekdays,
    isDateDisabled: dateDisabledPredicate,
    minDateTime,
    maxDateTime,
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
    const cd = useMemo(
        () =>
            customDesign === defaultCalendarDesign
                ? defaultCalendarDesign
                : { ...defaultCalendarDesign, ...customDesign },
        [customDesign],
    )
    const messages = useMemo(
        () => providedMessages ?? resolveCalendarMessages(locale),
        [providedMessages, locale],
    )
    const isInteractionDisabled = disabled || readOnly
    const dayItems = handleGetDaysInMonth()

    const weekdayMask = useMemo(
        () => buildDisabledWeekdayMask(disabledWeekdays),
        [disabledWeekdays],
    )
    const effectiveMinTime = enableTime ? minTime : undefined
    const effectiveMaxTime = enableTime ? maxTime : undefined
    const hasDateTimeBounds = Boolean(
        minDateTime !== undefined ||
        maxDateTime !== undefined ||
        effectiveMinTime ||
        effectiveMaxTime,
    )
    const minDayNum = minDate ? toDayNumber(minDate) : Number.NEGATIVE_INFINITY
    const maxDayNum = maxDate ? toDayNumber(maxDate) : Number.POSITIVE_INFINITY

    const isDateDisabled = useCallback(
        (date: Date) =>
            isInteractionDisabled ||
            !isCalendarDayWithinBounds(date, minDate, maxDate) ||
            (weekdayMask !== 0 &&
                (weekdayMask & (1 << (date.getDay() || 7))) !== 0) ||
            (dateDisabledPredicate !== undefined &&
                isCalendarDateDisabled(date, {
                    isDateDisabled: dateDisabledPredicate,
                })) ||
            (hasDateTimeBounds &&
                !constrainCalendarDateTime(
                    date,
                    minDateTime,
                    maxDateTime,
                    effectiveMinTime,
                    effectiveMaxTime,
                )) ||
            (enableTime &&
                !hasCalendarTimeWithinBounds(date, minTime, maxTime)),
        [
            isInteractionDisabled,
            minDate,
            maxDate,
            weekdayMask,
            dateDisabledPredicate,
            hasDateTimeBounds,
            minDateTime,
            maxDateTime,
            effectiveMinTime,
            effectiveMaxTime,
            enableTime,
            minTime,
            maxTime,
        ],
    )

    const dayMeta = useMemo(
        () =>
            dayItems.map(({ date, isCurrentMonth }) => {
                const germanHolidayName = showHolidays
                    ? getGermanHolidayName(date)
                    : null
                const holidayName = germanHolidayName
                    ? (messages.holidayNames[
                          germanHolidayName as keyof typeof messages.holidayNames
                      ] ?? germanHolidayName)
                    : null
                return {
                    date,
                    isCurrentMonth,
                    dateKey: getCalendarDateKey(date),
                    dayNum: toDayNumber(date),
                    weekdayBit: 1 << (date.getDay() || 7),
                    holidayName,
                    dateLabel: dateFormatters.full.format(date),
                }
            }),
        [dayItems, dateFormatters, showHolidays, messages.holidayNames],
    )

    const { disabledFlags, availabilityKey, disabledByKey } = useMemo(() => {
        const flags: boolean[] = []
        const byKey = new Map<string, boolean>()
        const keyParts: string[] = [
            String(minDateTime ?? ''),
            String(maxDateTime ?? ''),
            minDate ? getCalendarDateKey(minDate) : '',
            maxDate ? getCalendarDateKey(maxDate) : '',
            effectiveMinTime ?? '',
            effectiveMaxTime ?? '',
        ]
        for (let i = 0; i < dayMeta.length; i += 1) {
            const meta = dayMeta[i]!
            const isDisabled =
                isInteractionDisabled ||
                meta.dayNum < minDayNum ||
                meta.dayNum > maxDayNum ||
                (weekdayMask !== 0 && (weekdayMask & meta.weekdayBit) !== 0) ||
                (dateDisabledPredicate !== undefined &&
                    dateDisabledPredicate(startOfCalendarDay(meta.date)) ===
                        true) ||
                (hasDateTimeBounds &&
                    !constrainCalendarDateTime(
                        meta.date,
                        minDateTime,
                        maxDateTime,
                        effectiveMinTime,
                        effectiveMaxTime,
                    )) ||
                (Boolean(enableTime) &&
                    !hasCalendarTimeWithinBounds(meta.date, minTime, maxTime))
            flags.push(isDisabled)
            byKey.set(meta.dateKey, isDisabled)
            keyParts.push(isDisabled ? meta.dateKey : '')
        }
        return {
            disabledFlags: flags,
            availabilityKey: keyParts.join('|'),
            disabledByKey: byKey,
        }
    }, [
        dayMeta,
        isInteractionDisabled,
        minDayNum,
        maxDayNum,
        weekdayMask,
        dateDisabledPredicate,
        hasDateTimeBounds,
        minDateTime,
        maxDateTime,
        minDate,
        maxDate,
        effectiveMinTime,
        effectiveMaxTime,
        enableTime,
        minTime,
        maxTime,
    ])

    const todayNum = getTodayDayNumber()

    let preferredDayNum: number | undefined
    if (Array.isArray(selectedDate)) {
        const first = selectedDate[0] ?? selectedDate[1]
        if (first) preferredDayNum = toDayNumber(first)
    } else if (selectedDate instanceof Date) {
        preferredDayNum = toDayNumber(selectedDate)
    }

    let preferredFocus: Date | undefined
    let todayFocus: Date | undefined
    let firstEnabledFocus: Date | undefined
    for (let i = 0; i < dayMeta.length; i += 1) {
        if (disabledFlags[i]) continue
        const meta = dayMeta[i]!
        if (!firstEnabledFocus) firstEnabledFocus = meta.date
        if (
            preferredDayNum !== undefined &&
            meta.dayNum === preferredDayNum &&
            !preferredFocus
        ) {
            preferredFocus = meta.date
            break
        }
        if (meta.dayNum === todayNum && !todayFocus) {
            todayFocus = meta.date
        }
    }
    const initialFocusDate = preferredFocus ?? todayFocus ?? firstEnabledFocus

    const isDateSelectable = useCallback(
        (date: Date) => !isDateDisabled(date),
        [isDateDisabled],
    )

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
        isDateSelectable,
        onViewDateChange,
    })

    const activeDateKey =
        state.activeDateKey && disabledByKey.get(state.activeDateKey) === false
            ? state.activeDateKey
            : initialFocusDate
              ? getCalendarDateKey(initialFocusDate)
              : ''

    const weekDays = useMemo(
        () =>
            Array.from({ length: visibleDays }, (_, index) => {
                const isoDay = ((weekStartsOn - 1 + index) % 7) + 1
                return {
                    shortName: messages.weekdays[isoDay - 1],
                    fullName: formatLongWeekday(dateFormatters.weekday, isoDay),
                }
            }),
        [visibleDays, weekStartsOn, messages.weekdays, dateFormatters],
    )

    const rows = useMemo(() => {
        const rangeStartNum =
            enableRange && Array.isArray(selectedDate) && selectedDate[0]
                ? toDayNumber(selectedDate[0])
                : undefined
        const rangeEndNum =
            enableRange && Array.isArray(selectedDate) && selectedDate[1]
                ? toDayNumber(selectedDate[1])
                : undefined
        const singleSelectedNum =
            !enableRange && selectedDate instanceof Date
                ? toDayNumber(selectedDate)
                : undefined
        const isEn = locale === 'en'
        const rowCount = Math.ceil(dayMeta.length / visibleDays)
        const builtRows = []

        for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
            const startIdx = rowIndex * visibleDays
            const endIdx = Math.min(startIdx + visibleDays, dayMeta.length)
            const week = []

            for (let idx = startIdx; idx < endIdx; idx += 1) {
                const meta = dayMeta[idx]!
                const dayDisabled = disabledFlags[idx]!
                const dayNum = meta.dayNum
                let isSelected = false
                let isInRange = false
                let rangeMembership: string | undefined

                if (enableRange && Array.isArray(selectedDate)) {
                    if (
                        rangeStartNum !== undefined &&
                        dayNum === rangeStartNum
                    ) {
                        isSelected = true
                        rangeMembership =
                            rangeEndNum !== undefined && dayNum === rangeEndNum
                                ? isEn
                                    ? 'start and end of selected range'
                                    : 'Anfang und Ende des ausgewählten Zeitraums'
                                : isEn
                                  ? 'start of selected range'
                                  : 'Beginn des ausgewählten Zeitraums'
                    }
                    if (rangeEndNum !== undefined && dayNum === rangeEndNum) {
                        isSelected = true
                        rangeMembership ??= isEn
                            ? 'end of selected range'
                            : 'Ende des ausgewählten Zeitraums'
                    }
                    if (
                        rangeStartNum !== undefined &&
                        rangeEndNum !== undefined &&
                        dayNum > rangeStartNum &&
                        dayNum < rangeEndNum
                    ) {
                        isInRange = true
                        rangeMembership = isEn
                            ? 'within selected range'
                            : 'im ausgewählten Zeitraum'
                    }
                } else if (singleSelectedNum !== undefined) {
                    isSelected = dayNum === singleSelectedNum
                }

                const isCurrentDay = dayNum === todayNum
                let buttonClass =
                    'h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-colors relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rentner-accent/50 '

                if (dayDisabled) {
                    buttonClass += `opacity-30 cursor-not-allowed ${cd.textDisabled} `
                } else {
                    buttonClass += 'cursor-pointer '
                    if (isSelected) {
                        buttonClass += `${cd.primaryBg} ${cd.textBackground} font-bold `
                    } else if (isInRange) {
                        buttonClass += `${cd.primaryBgSubtle} ${cd.textColor} `
                    } else if (!meta.isCurrentMonth) {
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

                week.push({
                    date: meta.date,
                    dateKey: meta.dateKey,
                    isSelected,
                    isInRange,
                    holidayName: meta.holidayName,
                    dayDisabled,
                    isCurrentDay,
                    buttonClass,
                    dateLabel: meta.dateLabel,
                    rangeMembership,
                })
            }

            builtRows.push(week)
        }

        return builtRows
    }, [
        dayMeta,
        disabledFlags,
        visibleDays,
        enableRange,
        selectedDate,
        locale,
        todayNum,
        cd,
    ])

    const handleSelectDate = useCallback(
        (date: Date) => {
            if (!isDateDisabled(date)) onSelectDate(date)
        },
        [isDateDisabled, onSelectDate],
    )

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
