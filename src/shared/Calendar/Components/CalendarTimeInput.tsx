/* oxlint-disable jsx-a11y/prefer-tag-over-role -- The segmented textbox handles digit navigation in one custom focus target; a native input would change its keyboard contract. */
import useCalendarTimeInputLogic from '../Hooks/useCalendarTimeInputLogic.ts'
import type {
    SingleTimeInputProps,
    CalendarTimeDigitProps,
} from '../Types/CalendarTimeInput.types.ts'
import useSingleTimeInputLogic from '../Hooks/useSingleTimeInputLogic.ts'
import type { CalendarTimeInputProps } from '../Types/Calendar.types.ts'

function SingleTimeInput({
    date,
    label,
    onChangeDate,
    cd,
    minTime,
    maxTime,
    disabled = false,
    readOnly = false,
}: SingleTimeInputProps) {
    const { state, handler, setter, refs } = useSingleTimeInputLogic({
        date,
        onChangeDate,
        minTime,
        maxTime,
        disabled,
        readOnly,
        cd,
    })
    const { timeStr, cursorPos } = state
    const { setCursorPos } = setter
    const { containerRef } = refs
    const { handleKeyDown } = handler

    return (
        <div className="flex flex-col gap-1 items-center">
            {label && (
                <span
                    className={`text-[10px] ${cd.textMuted} font-bold uppercase tracking-wider`}
                >
                    {label}
                </span>
            )}
            <div
                ref={containerRef}
                tabIndex={disabled || readOnly ? -1 : 0}
                role="textbox"
                aria-label={`${label ?? 'Time'} ${timeStr.slice(0, 2)}:${timeStr.slice(2)}`}
                aria-disabled={disabled || undefined}
                aria-readonly={readOnly || undefined}
                onKeyDown={handleKeyDown}
                onFocus={handler.handleFocus}
                onBlur={handler.handleBlur}
                className={`relative flex items-center justify-center bg-transparent border ${cd.borderColor} rounded-lg px-3 py-1.5 ${cd.primaryFocusBorder} ${cd.primaryRing} transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${disabled || readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
            >
                <div
                    className={`flex items-center ${cd.textColor} text-[15px] font-medium gap-0.5`}
                >
                    <Digit
                        char={timeStr[0]}
                        isActive={cursorPos === 0}
                        onClick={() => setCursorPos(0)}
                        cd={cd}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <Digit
                        char={timeStr[1]}
                        isActive={cursorPos === 1}
                        onClick={() => setCursorPos(1)}
                        cd={cd}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <span
                        className={`mx-0.5 pb-0.5 ${cd.textMutedDark} font-bold`}
                    >
                        :
                    </span>
                    <Digit
                        char={timeStr[2]}
                        isActive={cursorPos === 2}
                        onClick={() => setCursorPos(2)}
                        cd={cd}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                    <Digit
                        char={timeStr[3]}
                        isActive={cursorPos === 3}
                        onClick={() => setCursorPos(3)}
                        cd={cd}
                        disabled={disabled}
                        readOnly={readOnly}
                    />
                </div>
            </div>
        </div>
    )
}

function Digit({
    char,
    isActive,
    onClick,
    cd,
    disabled = false,
    readOnly = false,
}: CalendarTimeDigitProps) {
    return (
        <span
            aria-hidden="true"
            onClick={(e) => {
                e.stopPropagation()
                if (!disabled && !readOnly) onClick()
            }}
            className={`w-3 text-center border-b-[1.5px] ${disabled || readOnly ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors ${isActive ? `${cd.primaryBorder} ${cd.primaryColor}` : cd.borderTransparent}`}
        >
            {char}
        </span>
    )
}

export default function CalendarTimeInput(props: CalendarTimeInputProps) {
    const { state, handler } = useCalendarTimeInputLogic(props)
    const {
        cd,
        messages,
        rangeValue,
        singleDate,
        enableRange,
        minTime,
        maxTime,
        disabled,
        readOnly,
    } = state
    const { handleUpdate } = handler

    return (
        <div
            className={`mt-4 pt-4 border-t ${cd.borderColor} flex justify-around gap-4`}
        >
            {enableRange ? (
                <>
                    <SingleTimeInput
                        date={rangeValue[0]}
                        label={messages.from}
                        onChangeDate={(d) => handleUpdate(0, d)}
                        cd={cd}
                        minTime={minTime}
                        maxTime={maxTime}
                        disabled={disabled || !rangeValue[0]}
                        readOnly={readOnly}
                    />
                    <SingleTimeInput
                        date={rangeValue[1]}
                        label={messages.to}
                        onChangeDate={(d) => handleUpdate(1, d)}
                        cd={cd}
                        minTime={minTime}
                        maxTime={maxTime}
                        disabled={disabled || !rangeValue[1]}
                        readOnly={readOnly}
                    />
                </>
            ) : (
                <SingleTimeInput
                    date={singleDate}
                    label={messages.time}
                    onChangeDate={(d) => handleUpdate(0, d)}
                    cd={cd}
                    minTime={minTime}
                    maxTime={maxTime}
                    disabled={disabled || !singleDate}
                    readOnly={readOnly}
                />
            )}
        </div>
    )
}
