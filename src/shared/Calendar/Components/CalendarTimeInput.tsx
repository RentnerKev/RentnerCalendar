import useCalendarTimeInputLogic from '../Hooks/useCalendarTimeInputLogic.ts'
import type { SingleTimeInputProps } from '../Types/CalendarTimeInput.types.ts'
import useSingleTimeInputLogic from '../Hooks/useSingleTimeInputLogic.ts'
import type { CalendarTimeInputProps } from '../Types/Calendar.types.ts'

function SingleTimeInput({
    date,
    label,
    onChangeDate,
    cd,
    minDateTime,
    maxDateTime,
    classNames,
    controlSize,
    minTime,
    maxTime,
    disabled = false,
    readOnly = false,
}: SingleTimeInputProps) {
    const { state, handler, refs } = useSingleTimeInputLogic({
        date,
        onChangeDate,
        minDateTime,
        maxDateTime,
        minTime,
        maxTime,
        disabled,
        readOnly,
        cd,
    })
    const { timeStr, cursorPos } = state
    const { inputRef } = refs
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
                className={`relative flex items-center justify-center border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 ${controlSize ? { sm: 'h-rentner-control-sm', md: 'h-rentner-control-md', lg: 'h-rentner-control-lg' }[controlSize] : ''} ${classNames?.time ?? `bg-transparent ${cd.borderColor} rounded-lg ${cd.primaryFocusBorder} ${cd.primaryRing} shadow-sm`} ${disabled || readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-text'}`}
            >
                <input
                    ref={inputRef}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    spellCheck={false}
                    value={timeStr}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-label={`${label ?? 'Time'} ${timeStr.slice(0, 2)}:${timeStr.slice(2)}`}
                    onKeyDown={handleKeyDown}
                    onChange={handler.handleChange}
                    onPaste={handler.handlePaste}
                    onClick={handler.handleClick}
                    onFocus={handler.handleFocus}
                    onBlur={handler.handleBlur}
                    className="absolute inset-0 w-full h-full cursor-text bg-transparent text-transparent caret-transparent outline-none rounded-[inherit] focus-visible:ring-2"
                />
                <div
                    aria-hidden="true"
                    className={`pointer-events-none flex items-center ${cd.textColor} text-[15px] font-medium gap-0.5`}
                >
                    {[0, 1, 2, 3].map((position) => (
                        <span key={position} className="contents">
                            {position === 2 && (
                                <span
                                    className={`mx-0.5 pb-0.5 ${cd.textMutedDark} font-bold`}
                                >
                                    :
                                </span>
                            )}
                            <span
                                data-time-digit={position}
                                className={`w-3 text-center border-b-[1.5px] transition-colors ${cursorPos === position ? `${cd.primaryBorder} ${cd.primaryColor}` : cd.borderTransparent}`}
                            >
                                {timeStr[position]}
                            </span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
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
                        minDateTime={props.minDateTime}
                        maxDateTime={props.maxDateTime}
                        classNames={props.classNames}
                        controlSize={props.controlSize}
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
                        minDateTime={props.minDateTime}
                        maxDateTime={props.maxDateTime}
                        classNames={props.classNames}
                        controlSize={props.controlSize}
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
                    minDateTime={props.minDateTime}
                    maxDateTime={props.maxDateTime}
                    classNames={props.classNames}
                    controlSize={props.controlSize}
                    minTime={minTime}
                    maxTime={maxTime}
                    disabled={disabled || !singleDate}
                    readOnly={readOnly}
                />
            )}
        </div>
    )
}
