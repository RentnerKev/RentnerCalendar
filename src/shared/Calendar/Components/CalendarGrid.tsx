/* oxlint-disable jsx-a11y/prefer-tag-over-role -- This ARIA grid uses roving date-button focus and CSS rows; native table tags would change the existing composite widget. */
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.ts'
import { CustomTooltip } from '@rentnerkev/tooltips'
import { getCalendarDateKey } from '../../../lib/Calendar/CalendarDay.ts'
import useCalendarGridLogic from '../Hooks/useCalendarGridLogic.ts'
import type { CalendarGridInternalProps } from '../Types/CalendarGrid.types.ts'

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
    const { state, handler, refs } = useCalendarGridLogic({
        handleGetDaysInMonth,
        selectedDate,
        onSelectDate,
        enableRange,
        enableTime,
        customDesign,
        minDate,
        maxDate,
        minTime,
        maxTime,
        visibleDays,
        weekStartsOn,
        showHolidays,
        locale,
        messages: providedMessages,
        disabled,
        readOnly,
        currentDate,
        onViewDateChange,
        monthHeadingId,
        keyboardHelpId,
    })
    const { cd, messages, rows, weekDays, activeDateKey } = state
    const { gridRef } = refs
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
                                const {
                                    dateKey,
                                    isSelected,
                                    isInRange,
                                    holidayName,
                                    dayDisabled,
                                    isCurrentDay,
                                    buttonClass,
                                    dateLabel,
                                    rangeMembership,
                                } = dayObj
                                const dayButton = (
                                    <button
                                        key={dateKey}
                                        data-calendar-day=""
                                        data-calendar-date={dateKey}
                                        onClick={() =>
                                            handler.handleSelectDate(
                                                dayObj.date,
                                            )
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
