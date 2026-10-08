export type CalendarLocale = 'de' | 'en'

export type CalendarHolidayName =
    | 'Neujahr'
    | 'Tag der Arbeit'
    | 'Tag der Deutschen Einheit'
    | 'Heiligabend'
    | '1. Weihnachtstag'
    | '2. Weihnachtstag'
    | 'Silvester'
    | 'Karfreitag'
    | 'Ostersonntag'
    | 'Ostermontag'
    | 'Christi Himmelfahrt'
    | 'Pfingstsonntag'
    | 'Pfingstmontag'

export interface CalendarMessages {
    placeholder: string
    required: string
    apply: string
    clear: string
    openCalendar: string
    closeCalendar: string
    previousMonth: string
    nextMonth: string
    day: string
    range: string
    from: string
    to: string
    time: string
    month: string
    year: string
    searchOptions: string
    searchPlaceholder: string
    keyboardHelp?: string
    noResults: string
    noOptions: string
    selectDate: (date: string) => string
    minSelection: (count: number) => string
    maxSelection: (count: number) => string
    weekdays: readonly string[]
    months: readonly string[]
    holidayNames: Readonly<Partial<Record<CalendarHolidayName, string>>>
}
