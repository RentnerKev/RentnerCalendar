import useCalendarHeaderLogic from '../Hooks/useCalendarHeaderLogic.ts'
import type {
    CalendarHeaderInternalProps,
    FastEditSelectProps,
} from '../Types/CalendarHeader.types.ts'
import { CustomSelect } from './Internal/Select.tsx'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { defaultCalendarDesign } from '../../../config/calendarDesign.config.ts'

function FastEditSelect({
    classNames,
    controlSize,
    portalContainer,
    portalClassName,
    portalZIndex,
    customDesign,
    value,
    options,
    className = '',
    onChange,
    messages,
    ariaLabel,
    disabled = false,
    readOnly = false,
    portalOwnerId,
}: FastEditSelectProps) {
    return (
        <div className={className}>
            <CustomSelect
                classNames={classNames}
                controlSize={controlSize}
                portalContainer={portalContainer}
                portalClassName={portalClassName}
                portalZIndex={portalZIndex}
                customDesign={customDesign}
                value={value}
                onValueChange={onChange}
                options={options}
                messages={messages}
                portalOwnerId={portalOwnerId}
                aria-label={ariaLabel}
                disabled={disabled}
                readOnly={readOnly}
                className="w-full !min-w-0 !py-2 !pl-3 !pr-8"
            />
        </div>
    )
}

export default function CalendarHeader({
    classNames,
    controlSize,
    portalContainer,
    portalClassName,
    portalZIndex,
    dialogId,
    currentDate,
    onPrevMonth,
    onNextMonth,
    onViewDateChange,
    fastEdit = true,
    customDesign = defaultCalendarDesign,
    messages: providedMessages,
    monthHeadingId,
    disabled = false,
    readOnly = false,
}: CalendarHeaderInternalProps) {
    const { state, handler } = useCalendarHeaderLogic({
        dialogId,
        currentDate,
        onPrevMonth,
        onNextMonth,
        onViewDateChange,
        fastEdit,
        customDesign,
        messages: providedMessages,
        monthHeadingId,
        disabled,
        readOnly,
    })
    const {
        cd,
        messages,
        currentMonth,
        currentYear,
        monthOptions,
        yearOptions,
    } = state
    const { handleMonthChange, handleYearChange } = handler
    return (
        <div
            className={`sticky top-0 z-10 flex items-center justify-between mb-4 px-1 ${classNames?.header ?? cd.surfaceBackground}`}
        >
            <button
                onClick={onPrevMonth}
                aria-label={messages.previousMonth}
                className={`p-2 rounded-xl cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rentner-accent/50 ${cd.hoverBackground} ${cd.hoverText} motion-safe:active:scale-95`}
                type="button"
                disabled={disabled || readOnly}
            >
                <ChevronLeft className={`w-5 h-5 ${cd.textMuted}`} />
            </button>

            {fastEdit ? (
                <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1">
                    <FastEditSelect
                        classNames={classNames}
                        controlSize={controlSize}
                        portalContainer={portalContainer}
                        portalClassName={portalClassName}
                        portalZIndex={portalZIndex}
                        customDesign={cd}
                        value={currentMonth.toString()}
                        onChange={handleMonthChange}
                        options={monthOptions}
                        messages={messages}
                        ariaLabel={messages.month}
                        disabled={disabled}
                        readOnly={readOnly}
                        portalOwnerId={dialogId}
                        className="min-w-0 flex-[1.4_1_0]"
                    />
                    <FastEditSelect
                        classNames={classNames}
                        controlSize={controlSize}
                        portalContainer={portalContainer}
                        portalClassName={portalClassName}
                        portalZIndex={portalZIndex}
                        customDesign={cd}
                        value={currentYear.toString()}
                        onChange={handleYearChange}
                        options={yearOptions}
                        messages={messages}
                        ariaLabel={messages.year}
                        disabled={disabled}
                        readOnly={readOnly}
                        portalOwnerId={dialogId}
                        className="min-w-0 flex-[0.8_1_0]"
                    />
                </div>
            ) : (
                <h2
                    id={monthHeadingId}
                    aria-live="polite"
                    aria-atomic="true"
                    className={`text-[15px] font-bold ${cd.textColor} tracking-wide`}
                >
                    {`${messages.months[currentMonth]} ${currentYear}`}
                </h2>
            )}

            {fastEdit && (
                <h2
                    id={monthHeadingId}
                    aria-live="polite"
                    aria-atomic="true"
                    className="sr-only"
                >
                    {`${messages.months[currentMonth]} ${currentYear}`}
                </h2>
            )}

            <button
                onClick={onNextMonth}
                aria-label={messages.nextMonth}
                className={`p-2 rounded-xl cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rentner-accent/50 ${cd.hoverBackground} ${cd.hoverText} motion-safe:active:scale-95`}
                type="button"
                disabled={disabled || readOnly}
            >
                <ChevronRight className={`w-5 h-5 ${cd.textMuted}`} />
            </button>
        </div>
    )
}
