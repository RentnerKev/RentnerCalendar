import type { CSSProperties, RefObject } from 'react'
import CalendarGrid from './CalendarGrid.js'
import CalendarHeader from './CalendarHeader.js'
import CalendarTimeInput from './CalendarTimeInput.js'
import type { CalendarMessages, CalendarLocale } from '../messages.js'
import type { CalendarCustomDesign, CalendarValue } from '../types.js'

interface CalendarPopoverProps {
    backdrop: boolean
    onClose: () => void
    dialogId: string
    popoverRef: RefObject<HTMLDivElement | null>
    className: string
    style: CSSProperties
    labelledBy?: string
    describedBy?: string
    dialogLabel: string
    switchMode: boolean
    isRangeMode: boolean
    onRangeModeChange: (isRange: boolean) => void
    disabled: boolean
    readOnly: boolean
    messages: CalendarMessages
    currentDate: Date
    onPrevMonth: () => void
    onNextMonth: () => void
    onViewDateChange: (date: Date) => void
    fastEdit: boolean
    customDesign: CalendarCustomDesign
    getDaysInMonth: () => { date: Date; isCurrentMonth: boolean }[]
    selectedDate?: CalendarValue
    onSelectDate: (date: Date) => void
    minDate?: Date
    maxDate?: Date
    weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7
    visibleDays: number
    showHolidays: boolean
    locale: CalendarLocale
    enableTime: boolean
    onTimeChange: (value: CalendarValue) => void
    minTime?: string
    maxTime?: string
    button: boolean
    onApply: () => void
}

export default function CalendarPopover({
    backdrop,
    onClose,
    dialogId,
    popoverRef,
    className,
    style,
    labelledBy,
    describedBy,
    dialogLabel,
    switchMode,
    isRangeMode,
    onRangeModeChange,
    disabled,
    readOnly,
    messages,
    currentDate,
    onPrevMonth,
    onNextMonth,
    onViewDateChange,
    fastEdit,
    customDesign,
    getDaysInMonth,
    selectedDate,
    onSelectDate,
    minDate,
    maxDate,
    weekStartsOn,
    visibleDays,
    showHolidays,
    locale,
    enableTime,
    onTimeChange,
    minTime,
    maxTime,
    button,
    onApply,
}: CalendarPopoverProps) {
    return (
        <>
            {backdrop && (
                <div
                    aria-hidden="true"
                    className="fixed inset-0 z-[8999]"
                    onClick={(event) => {
                        event.stopPropagation()
                        onClose()
                    }}
                />
            )}
            <div
                id={dialogId}
                ref={popoverRef}
                className={className}
                style={style}
                role="dialog"
                aria-modal="false"
                aria-labelledby={labelledBy}
                aria-label={labelledBy ? undefined : dialogLabel}
                aria-describedby={describedBy}
                tabIndex={-1}
                onClick={(event) => event.stopPropagation()}
            >
                {switchMode && (
                    <div className="mb-4 flex items-center justify-between rounded-lg border bg-black/20 p-1">
                        <button
                            type="button"
                            onClick={() => onRangeModeChange(false)}
                            aria-label={messages.day}
                            aria-pressed={!isRangeMode}
                            disabled={disabled || readOnly}
                            className={`flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${!isRangeMode ? `${customDesign.primaryBg} ${customDesign.textBackground} shadow-sm` : `${customDesign.textMuted} ${customDesign.hoverText} hover:bg-white/5`}`}
                        >
                            {messages.day}
                        </button>
                        <button
                            type="button"
                            onClick={() => onRangeModeChange(true)}
                            aria-label={messages.range}
                            aria-pressed={isRangeMode}
                            disabled={disabled || readOnly}
                            className={`flex-1 cursor-pointer rounded-md py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${isRangeMode ? `${customDesign.primaryBg} ${customDesign.textBackground} shadow-sm` : `${customDesign.textMuted} ${customDesign.hoverText} hover:bg-white/5`}`}
                        >
                            {messages.range}
                        </button>
                    </div>
                )}

                <CalendarHeader
                    currentDate={currentDate}
                    onPrevMonth={onPrevMonth}
                    onNextMonth={onNextMonth}
                    onViewDateChange={onViewDateChange}
                    fastEdit={fastEdit}
                    customDesign={customDesign}
                    messages={messages}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <CalendarGrid
                    handleGetDaysInMonth={getDaysInMonth}
                    selectedDate={selectedDate}
                    onSelectDate={onSelectDate}
                    enableRange={isRangeMode}
                    customDesign={customDesign}
                    minDate={minDate}
                    maxDate={maxDate}
                    weekStartsOn={weekStartsOn}
                    visibleDays={visibleDays}
                    showHolidays={showHolidays}
                    locale={locale}
                    messages={messages}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                {enableTime && (
                    <CalendarTimeInput
                        value={selectedDate}
                        onChange={onTimeChange}
                        enableRange={isRangeMode}
                        customDesign={customDesign}
                        minTime={minTime}
                        maxTime={maxTime}
                        messages={messages}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                )}
                {button && (
                    <button
                        type="button"
                        onClick={onApply}
                        disabled={disabled || readOnly}
                        className={`mt-4 w-full cursor-pointer rounded-lg py-2 font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${customDesign.primaryBg} ${customDesign.primaryHover}`}
                    >
                        {messages.apply}
                    </button>
                )}
            </div>
        </>
    )
}
