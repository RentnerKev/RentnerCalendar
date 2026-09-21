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
    searchOptions: string
    searchPlaceholder: string
    noResults: string
    noOptions: string
    selectDate: (date: string) => string
    minSelection: (count: number) => string
    maxSelection: (count: number) => string
    weekdays: readonly string[]
    months: readonly string[]
    holidayNames: Readonly<Partial<Record<CalendarHolidayName, string>>>
}

const germanHolidayNames: Record<CalendarHolidayName, string> = {
    Neujahr: 'Neujahr',
    'Tag der Arbeit': 'Tag der Arbeit',
    'Tag der Deutschen Einheit': 'Tag der Deutschen Einheit',
    Heiligabend: 'Heiligabend',
    '1. Weihnachtstag': '1. Weihnachtstag',
    '2. Weihnachtstag': '2. Weihnachtstag',
    Silvester: 'Silvester',
    Karfreitag: 'Karfreitag',
    Ostersonntag: 'Ostersonntag',
    Ostermontag: 'Ostermontag',
    'Christi Himmelfahrt': 'Christi Himmelfahrt',
    Pfingstsonntag: 'Pfingstsonntag',
    Pfingstmontag: 'Pfingstmontag',
}

const englishHolidayNames: Record<CalendarHolidayName, string> = {
    Neujahr: "New Year's Day",
    'Tag der Arbeit': 'Labour Day',
    'Tag der Deutschen Einheit': 'German Unity Day',
    Heiligabend: 'Christmas Eve',
    '1. Weihnachtstag': 'Christmas Day',
    '2. Weihnachtstag': 'Boxing Day',
    Silvester: "New Year's Eve",
    Karfreitag: 'Good Friday',
    Ostersonntag: 'Easter Sunday',
    Ostermontag: 'Easter Monday',
    'Christi Himmelfahrt': 'Ascension Day',
    Pfingstsonntag: 'Whit Sunday',
    Pfingstmontag: 'Whit Monday',
}

const germanMessages: CalendarMessages = {
    placeholder: 'Klicke hier um die Auswahlen zu sehen!',
    required: 'Dieses Feld ist erforderlich',
    apply: 'Anwenden',
    clear: 'Auswahl löschen',
    openCalendar: 'Kalender öffnen',
    closeCalendar: 'Kalender schließen',
    previousMonth: 'Vorheriger Monat',
    nextMonth: 'Nächster Monat',
    day: 'Tag',
    range: 'Zeitraum',
    from: 'Von',
    to: 'Bis',
    time: 'Zeit',
    searchOptions: 'Optionen suchen',
    searchPlaceholder: 'Suchen...',
    noResults: 'Keine Ergebnisse',
    noOptions: 'Keine Optionen',
    selectDate: (date) => `Datum auswählen: ${date}`,
    minSelection: (count) => `Mindestens ${count} Optionen auswählen`,
    maxSelection: (count) => `Maximal ${count} Optionen auswählen`,
    weekdays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    months: [
        'Januar',
        'Februar',
        'März',
        'April',
        'Mai',
        'Juni',
        'Juli',
        'August',
        'September',
        'Oktober',
        'November',
        'Dezember',
    ],
    holidayNames: germanHolidayNames,
}

const englishMessages: CalendarMessages = {
    placeholder: 'Click here to view the selections!',
    required: 'This field is required',
    apply: 'Apply',
    clear: 'Clear selection',
    openCalendar: 'Open calendar',
    closeCalendar: 'Close calendar',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    day: 'Day',
    range: 'Range',
    from: 'From',
    to: 'To',
    time: 'Time',
    searchOptions: 'Search options',
    searchPlaceholder: 'Search...',
    noResults: 'No results',
    noOptions: 'No options',
    selectDate: (date) => `Select date: ${date}`,
    minSelection: (count) => `Select at least ${count} options`,
    maxSelection: (count) => `Select at most ${count} options`,
    weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
    ],
    holidayNames: englishHolidayNames,
}

export const calendarMessageCatalog: Record<CalendarLocale, CalendarMessages> =
    {
        de: germanMessages,
        en: englishMessages,
    }

export function resolveCalendarMessages(
    locale: CalendarLocale = 'de',
    overrides?: Partial<CalendarMessages>,
): CalendarMessages {
    const defaults = calendarMessageCatalog[locale]

    return {
        ...defaults,
        ...overrides,
        weekdays: overrides?.weekdays ?? defaults.weekdays,
        months: overrides?.months ?? defaults.months,
        holidayNames: {
            ...defaults.holidayNames,
            ...overrides?.holidayNames,
        },
    }
}
