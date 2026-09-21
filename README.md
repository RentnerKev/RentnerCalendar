# @rentnerkev/calendar

Ein flexibler React-DatePicker für Einzeltermine und Zeiträume mit Uhrzeit, Formularvalidierung und anpassbarem Tailwind-Design.

## Installation

Installiere das Paket mit npm oder Bun:

```bash
npm install @rentnerkev/calendar
```

## Verwendung

### Einfacher DatePicker

```tsx
import { useState } from 'react'
import { CustomCalendar } from '@rentnerkev/calendar'

function MyComponent() {
    const [date, setDate] = useState<Date | undefined>(new Date())

    return (
        <CustomCalendar
            id="appointment"
            name="appointment"
            value={date}
            onChange={(val) => setDate(val as Date)}
            placeholder="Datum wählen..."
            required
        />
    )
}
```

### Required im Formular

`required` ist standardmäßig deaktiviert. Wenn du es setzt und beim Submit noch kein Datum ausgewählt wurde, wird der Kalender rot, das linke Icon wird durch ein Ausrufezeichen ersetzt und der Fehlertext wird im Tooltip angezeigt. Das ist das hilfreich, wenn ein Placeholder wie "Termin auswählen" nur ein Hinweis und keine echte Auswahl sein soll.

```tsx
import { useState } from 'react'
import { CustomCalendar, CalendarValue } from '@rentnerkev/calendar'
import { CalendarClock } from 'lucide-react'

function RequiredCalendarForm() {
    const [appointment, setAppointment] = useState<CalendarValue>()

    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                event.currentTarget.reportValidity()
            }}
        >
            <CustomCalendar
                id="appointment"
                name="appointment"
                value={appointment}
                onChange={setAppointment}
                placeholder="Termin auswählen"
                required
                enableTime
                closeOnSelect
                icon={<CalendarClock className="h-4 w-4" />}
            />

            <button type="submit">Absenden</button>
        </form>
    )
}
```

### Maximales Konfigurations-Beispiel

Hier siehst du alle verfügbaren Props im Einsatz:

```tsx
import { useState } from 'react'
import { CustomCalendar, CalendarValue } from '@rentnerkev/calendar'
import { Clock } from 'lucide-react'

function FullFeaturedPicker() {
    const [value, setValue] = useState<CalendarValue>([new Date(), null])

    return (
        <CustomCalendar
            id="booking-range"
            name="bookingRange"
            value={value}
            onChange={setValue}
            required={true} // Pflichtfeld mit rotem Fehlerzustand beim Submit
            enableRange={true} // Start- und Enddatum Auswahl
            enableTime={true} // Uhrzeit-Eingabe (HH:mm)
            button={true} // "Anwenden" Button anzeigen
            backdrop={true} // Schließt Popover bei Klick außerhalb
            customDesign={myDesign} // Eigene Farben auf die Kalender Component
            icon={<Clock size={16} />} // Eigenes Icon (oder false zum Ausblenden)
            placeholder="Zeitraum wählen..." // Wird angezeigt wenn nichts ausgewählt ist
            className="w-120 h-20 rounded-lg" // Container Klasse
            closeOnSelect={true} // Popover schließt nach Datumsauswahl automatisch
            minDate={new Date()} // Kein Datum vor heute wählbar
            maxDate={new Date('2026-12-31')} // Kein Datum nach 2026 wählbar
            minTime="08:00" // Früheste auswählbare Zeit
            maxTime="18:00" // Späteste auswählbare Zeit
            weekStartsOn={1} // Woche startet am Montag (1=Mo, 7=So)
            visibleDays={5} // Zeigt nur 5 Tage an (z.B. Mo-Fr)
            showHolidays={true} // Deutsche Feiertage mit Punkt & Tooltip markieren
            switchMode={true} // Erlaubt dem User zwischen Einzeldatum und Zeitraum zu wechseln
            isDeletatable={true} // Zeigt einen Löschen-Button an, um die Auswahl zu leeren
        />
    )
}
```

## Custom Design (Theming)

Du kannst das Aussehen des Kalenders über die `customDesign` Prop anpassen. Hierbei werden Tailwind-Klassen für die verschiedenen Elemente übergeben.

```tsx
import { CustomCalendar, CalendarCustomDesign } from '@rentnerkev/calendar'

const myDesign: CalendarCustomDesign = {
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    surfaceBackground: 'bg-slate-900',
    borderColor: 'border-slate-700',
    // ... alle weiteren Felder sind optional
}

function App() {
    return <CustomCalendar customDesign={myDesign} />
}
```

### Verfügbare Design-Felder

| Feld                | Typ      | Beschreibung                                                   |
| ------------------- | -------- | -------------------------------------------------------------- |
| `primaryColor`      | `string` | Klasse für primäre Textfarbe (z.B. `text-primary`).            |
| `primaryBg`         | `string` | Hintergrund für ausgewählte Tage (z.B. `bg-primary`).          |
| `primaryHover`      | `string` | Hover-Hintergrund für Buttons (z.B. `hover:bg-primary-hover`). |
| `primaryBorder`     | `string` | Rahmenfarbe für den aktiven Zustand (z.B. `border-primary`).   |
| `primaryRing`       | `string` | Klasse für den Focus-Ring (z.B. `focus:ring-primary/50`).      |
| `surfaceBackground` | `string` | Hintergrund des Popovers (z.B. `bg-surface-dark`).             |
| `inputBackground`   | `string` | Hintergrund des Input-Feldes (z.B. `bg-input-dark`).           |
| `borderColor`       | `string` | Standard Rahmenfarbe (z.B. `border-border-dark`).              |
| `textColor`         | `string` | Haupt-Textfarbe (z.B. `text-white`).                           |
| `textMuted`         | `string` | Farbe für weniger wichtigen Text (z.B. `text-gray-400`).       |
| `textMutedDark`     | `string` | Dunklere Muted-Farbe (z.B. `text-gray-500`).                   |
| `textDay`           | `string` | Farbe der Wochentage/Zahlen im Grid (z.B. `text-gray-300`).    |
| `hoverBackground`   | `string` | Hintergrund beim Hovern von Tagen (z.B. `hover:bg-white/5`).   |

_(Eine vollständige Liste findest du in den Typdefinitionen `CalendarCustomDesign` der Library)_

## Hilfsfunktionen

Die Library exportiert nützliche Funktionen zur Arbeit mit Daten und zur Formatierung:

| Funktion                     | Beschreibung                                                                                                                  |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `formatCalendarValue(value)` | Formatiert `Date` oder `Range` zu einem lesbaren String (z.B. "01.01.2024 12:00 - 02.01.2024").                               |
| `isSameDay(d1, d2)`          | Prüft, ob zwei Daten der gleiche Kalendertag sind.                                                                            |
| `isToday(date)`              | Prüft, ob das übergebene Datum der heutige Tag ist.                                                                           |
| `formatMonthName(date)`      | Gibt Monat und Jahr des Datums formatiert zurück (z.B. "Januar 2024").                                                        |
| `getGermanHolidayName(date)` | Prüft, ob ein Datum ein deutscher Feiertag ist, und gibt dessen Namen als String (z.B. "Silvester") zurück, andernfalls null. |

## Props (Typen)

### `CustomCalendar`

| Prop            | Typ                               | Standard         | Beschreibung                                                                                                      |
| --------------- | --------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `id`            | `string`                          | `undefined`      | ID für den sichtbaren Trigger, nützlich für Labels und Formularfelder.                                            |
| `name`          | `string`                          | `undefined`      | Name für Formular-Submit und native Pflichtfeld-Validierung.                                                      |
| `value`         | `CalendarInputValue`              | `undefined`      | Das aktuell ausgewählte Datum oder die Range. Unterstützt `Date`, `string` (ISO/Deutsch), `number` (Timestamp).   |
| `onChange`      | `(value: CalendarValue) => void`  | -                | Callback bei Änderung des Wertes.                                                                                 |
| `required`      | `boolean`                         | `false`          | Aktiviert Pflichtfeld-Validierung. Ohne Auswahl wird der Trigger beim Submit rot und zeigt den Fehler im Tooltip. |
| `enableTime`    | `boolean`                         | `false`          | Aktiviert die Zeitauswahl unter dem Kalendergrid.                                                                 |
| `enableRange`   | `boolean`                         | `false`          | Aktiviert die Auswahl eines Zeitraums (Start- und Enddatum).                                                      |
| `customDesign`  | `CalendarCustomDesign`            | `defaultDesign`  | Objekt zur individuellen Gestaltung des Designs.                                                                  |
| `placeholder`   | `string`                          | "Klicke hier..." | Platzhalter-Text im Input-Feld.                                                                                   |
| `button`        | `boolean`                         | `false`          | Zeigt einen "Anwenden"-Button im Popover an.                                                                      |
| `backdrop`      | `boolean`                         | `true`           | Schließt das Popover beim Klick außerhalb (Overlay).                                                              |
| `icon`          | `ReactNode \| boolean`            | `CalendarDays`   | Icon links im Input. Kann ein React-Element sein oder `false`, um das Icon komplett auszublenden.                 |
| `className`     | `string`                          | `""`             | Zusätzliche CSS-Klassen für den äußeren Container. Bestimmt auch den Radius des Popovers.                         |
| `closeOnSelect` | `boolean`                         | `false`          | Schließt das Popover automatisch, sobald ein Datum (oder eine vollständige Range) gewählt wurde.                  |
| `minDate`       | `CalendarInputValue`              | `undefined`      | Begrenzt die Auswahl auf Daten ab (inklusive) diesem Datum.                                                       |
| `maxDate`       | `CalendarInputValue`              | `undefined`      | Begrenzt die Auswahl auf Daten bis (inklusive) diesem Datum.                                                      |
| `minTime`       | `string`                          | `undefined`      | Früheste wählbare Uhrzeit im Format "HH:mm".                                                                      |
| `maxTime`       | `string`                          | `undefined`      | Späteste wählbare Uhrzeit im Format "HH:mm".                                                                      |
| `fastEdit`      | `boolean`                         | `true`           | Zeigt im Header schnelle Monat- und Jahr-Selects für größere Datumssprünge.                                       |
| `weekStartsOn`  | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7` | `1`              | Definiert den Start der Woche (1 = Montag, 7 = Sonntag).                                                          |
| `visibleDays`   | `number`                          | `7`              | Anzahl der sichtbaren Tage pro Woche im Grid.                                                                     |
| `showHolidays`  | `boolean`                         | `false`          | Markiert deutsche gesetzliche Feiertage mit einem Punkt und Tooltip.                                              |
| `switchMode`    | `boolean`                         | `false`          | Erlaubt es dem Nutzer, im Interface zwischen Einzeldatum- und Zeitraums-Modus zu wechseln.                        |
| `isDeletatable` | `boolean`                         | `false`          | Fügt einen Button hinzu, um den ausgewählten Wert zu löschen (null).                                              |

## CSS-Konfiguration

Der Kalender nutzt Tailwind CSS Variablen. Damit das Standard-Design korrekt angezeigt wird, füge dies zu deiner `index.css` hinzu:

```css
@import 'tailwindcss';
/* WICHTIG: Damit Tailwind die Klassen in der Library erkennt */
@source "../node_modules/@rentnerkev/calendar";

@theme {
    --color-primary: #13ecd6;
    --color-primary-hover: #0fbdaa;
    --color-background-dark: #0f1014;
    --color-surface-dark: #181a1f;
    --color-input-dark: #22252b;
    --color-border-dark: #2e323b;
    --color-secondary-text: #9ca3af;
}
```

## Entwicklung

```bash
bun install
bun run verify
bun run playground:dev
```

`bun run verify` prüft Typen, Oxlint, Oxfmt, den Paket-Build und den
veröffentlichten Paketinhalt per Dry Run.
