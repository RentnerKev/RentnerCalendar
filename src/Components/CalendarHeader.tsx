import { CustomSelect } from '../Internal/Select.js'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { defaultCalendarDesign } from '../types.js'
import type { CalendarHeaderProps } from '../types.js'
import { formatMonthName } from '../Tools/FormatFunctions.js'

interface FastEditOption {
    value: string
    label: string
}

interface FastEditSelectProps {
    value: string
    options: FastEditOption[]
    className?: string
    onChange: (value: string) => void
}

function FastEditSelect({
    value,
    options,
    className = '',
    onChange,
}: FastEditSelectProps) {
    return (
        <div className={className}>
            <CustomSelect
                value={value}
                onValueChange={onChange}
                options={options}
                className="h-9 w-full !min-w-0 rounded-lg !py-2 !pl-3 !pr-8"
            />
        </div>
    )
}

const monthOptions: FastEditOption[] = Array.from(
    { length: 12 },
    (_, month) => ({
        value: month.toString(),
        label: new Intl.DateTimeFormat('de-DE', { month: 'long' }).format(
            new Date(2024, month, 1),
        ),
    }),
)

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
}: CalendarHeaderProps) {
    const cd = { ...defaultCalendarDesign, ...customDesign }
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
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
                        className="min-w-0 flex-[1.4_1_0]"
                    />
                    <FastEditSelect
                        value={currentYear.toString()}
                        onChange={handleYearChange}
                        options={yearOptions}
                        className="min-w-0 flex-[0.8_1_0]"
                    />
                </div>
            ) : (
                <div
                    className={`text-[15px] font-bold ${cd.textColor} tracking-wide`}
                >
                    {formatMonthName(currentDate)}
                </div>
            )}

            <button
                onClick={onNextMonth}
                className={`p-2 rounded-xl cursor-pointer transition-all ${cd.hoverBackground} ${cd.hoverText} active:scale-95`}
                type="button"
            >
                <ChevronRight className={`w-5 h-5 ${cd.textMuted}`} />
            </button>
        </div>
    )
}
