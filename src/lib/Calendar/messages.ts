import type {
    CalendarLocale,
    CalendarHolidayName,
    CalendarMessages,
} from './Types/Messages.types.ts'
export type {
    CalendarLocale,
    CalendarHolidayName,
    CalendarMessages,
} from './Types/Messages.types.ts'
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
    month: 'Monat',
    year: 'Jahr',
    searchOptions: 'Optionen suchen',
    searchPlaceholder: 'Suchen…',
    keyboardHelp:
        'Pfeiltasten navigieren tageweise oder wochenweise. Pos1 und Ende springen zum Wochenanfang und -ende. Bild auf und Bild ab wechseln den Monat; mit Umschalttaste wechseln sie das Jahr.',
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
    month: 'Month',
    year: 'Year',
    searchOptions: 'Search options',
    searchPlaceholder: 'Search…',
    keyboardHelp:
        'Use arrow keys to move by day or week. Home and End move to the start and end of the week. Page Up and Page Down change the month; hold Shift to change the year.',
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
