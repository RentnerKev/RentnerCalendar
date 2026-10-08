/* oxlint-disable jsx-a11y/prefer-tag-over-role -- The portal dialog owns its existing focus trap and backdrop; native dialog top-layer behavior is not equivalent. */
import useCalendarPopoverLogic from '../Hooks/useCalendarPopoverLogic.ts'
import type { CalendarPopoverProps } from '../Types/CalendarPopover.types.ts'
import CalendarGrid from './CalendarGrid.tsx'
import CalendarHeader from './CalendarHeader.tsx'
import CalendarTimeInput from './CalendarTimeInput.tsx'

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
    const { state, handler } = useCalendarPopoverLogic({
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
    })
    const { monthHeadingId, keyboardHelpId, applyDisabled } = state
    const { handleDialogKeyDown } = handler
    return (
        <>
            {backdrop && (
                <div
                    role="presentation"
                    aria-hidden="true"
                    className="fixed inset-0 z-[8999]"
                    onClick={handler.handleBackdropClick}
                />
            )}
            {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- The ARIA dialog owns Escape/Tab focus trapping and stops portal clicks from reaching the consumer. */}
            <div
                id={dialogId}
                ref={popoverRef}
                className={className}
                style={style}
                role="dialog"
                aria-modal={backdrop}
                aria-labelledby={labelledBy}
                aria-label={labelledBy ? undefined : dialogLabel}
                aria-describedby={describedBy}
                tabIndex={-1}
                onKeyDown={handleDialogKeyDown}
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
                    dialogId={dialogId}
                    currentDate={currentDate}
                    onPrevMonth={onPrevMonth}
                    onNextMonth={onNextMonth}
                    onViewDateChange={onViewDateChange}
                    fastEdit={fastEdit}
                    customDesign={customDesign}
                    messages={messages}
                    monthHeadingId={monthHeadingId}
                    disabled={disabled}
                    readOnly={readOnly}
                />
                <CalendarGrid
                    handleGetDaysInMonth={getDaysInMonth}
                    selectedDate={selectedDate}
                    onSelectDate={onSelectDate}
                    enableRange={isRangeMode}
                    enableTime={enableTime}
                    customDesign={customDesign}
                    minDate={minDate}
                    maxDate={maxDate}
                    minTime={minTime}
                    maxTime={maxTime}
                    weekStartsOn={weekStartsOn}
                    visibleDays={visibleDays}
                    showHolidays={showHolidays}
                    locale={locale}
                    messages={messages}
                    disabled={disabled}
                    readOnly={readOnly}
                    currentDate={currentDate}
                    onViewDateChange={onViewDateChange}
                    monthHeadingId={monthHeadingId}
                    keyboardHelpId={keyboardHelpId}
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
                <p
                    id={keyboardHelpId}
                    className={`mt-3 text-[11px] leading-4 ${customDesign.textMuted}`}
                >
                    {messages.keyboardHelp}
                </p>
                {button && (
                    <button
                        type="button"
                        onClick={onApply}
                        disabled={disabled || readOnly || applyDisabled}
                        className={`mt-4 w-full cursor-pointer rounded-lg py-2 font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${customDesign.primaryBg} ${customDesign.primaryHover}`}
                    >
                        {messages.apply}
                    </button>
                )}
            </div>
        </>
    )
}
