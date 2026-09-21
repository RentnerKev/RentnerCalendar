import { CustomSelect } from '../Internal/Select.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { defaultCalendarDesign } from '../types.js'
import type { CalendarHeaderProps } from '../types.js'
import { resolveCalendarMessages } from '../messages.js'
import type { CalendarMessages } from '../messages.js'

interface FastEditOption {
    value: string
    label: string
}

interface FastEditSelectProps {
    value: string
    options: FastEditOption[]
    className?: string
    onChange: (value: string) => void
    messages: CalendarMessages
}

function FastEditSelect({
    value,
    options,
    className = '',
    onChange,
    messages,
}: FastEditSelectProps) {
    return (
        <div className={className}>
            <CustomSelect
                value={value}
                onValueChange={onChange}
                options={options}
                messages={messages}
                className="h-9 w-full !min-w-0 rounded-lg !py-2 !pl-3 !pr-8"
            />
        </div>
    )
}

function getYearOptions(currentYear: number): FastEditOption[] {
    const startYear = currentYear - 50
    return Array.from({ length: 101 }, (_, index) => {
        const year = startYear + index
        return {
            value: year.toString(),
            label: year.toString(),
        }
    })
}

export default function CalendarHeader({
    currentDate,
    onPrevMonth,
    onNextMonth,
    onViewDateChange,
    fastEdit = true,
    customDesign = defaultCalendarDesign,
    messages: providedMessages,
}: CalendarHeaderProps) {
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const messages = providedMessages ?? resolveCalendarMessages()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    const monthOptions: FastEditOption[] = messages.months.map(
        (label, month) => ({
            value: month.toString(),
            label,
        }),
    )
    const yearOptions = getYearOptions(currentYear)

    function handleMonthChange(value: string) {
        onViewDateChange(new Date(currentYear, Number(value), 1))
    }

    function handleYearChange(value: string) {
        onViewDateChange(new Date(Number(value), currentMonth, 1))
    }

    return (
        <div className="flex items-center justify-between mb-4 px-1">
            <button
                onClick={onPrevMonth}
                aria-label={messages.previousMonth}
                className={`p-2 rounded-xl cursor-pointer transition-all ${cd.hoverBackground} ${cd.hoverText} active:scale-95`}
                type="button"
            >
                <ChevronLeft className={`w-5 h-5 ${cd.textMuted}`} />
            </button>

            {fastEdit ? (
                <div className="flex min-w-0 flex-1 items-center justify-center gap-1 px-1">
                    <FastEditSelect
                        value={currentMonth.toString()}
                        onChange={handleMonthChange}
                        options={monthOptions}
                        messages={messages}
                        className="min-w-0 flex-[1.4_1_0]"
                    />
                    <FastEditSelect
                        value={currentYear.toString()}
                        onChange={handleYearChange}
                        options={yearOptions}
                        messages={messages}
                        className="min-w-0 flex-[0.8_1_0]"
                    />
                </div>
            ) : (
                <div
                    className={`text-[15px] font-bold ${cd.textColor} tracking-wide`}
                >
                    {`${messages.months[currentMonth]} ${currentYear}`}
                </div>
            )}

            <button
                onClick={onNextMonth}
                aria-label={messages.nextMonth}
                className={`p-2 rounded-xl cursor-pointer transition-all ${cd.hoverBackground} ${cd.hoverText} active:scale-95`}
                type="button"
            >
                <ChevronRight className={`w-5 h-5 ${cd.textMuted}`} />
            </button>
        </div>
    )
}
