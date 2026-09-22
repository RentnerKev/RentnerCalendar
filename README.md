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

## Sprache und Meldungen

Mit `locale="en"` verwendet der Kalender die vollständigen englischen
Standardtexte. `locale` ist standardmäßig `"de"`; bestehende deutsche
Anzeigen bleiben damit unverändert. Einzelne Meldungen können über `messages`
überschrieben werden:

```tsx
<CustomCalendar
    locale="en"
    messages={{
        apply: 'Save',
        required: 'Please choose a date',
    }}
/>
```

`CalendarMessages`, `calendarMessageCatalog` und `resolveCalendarMessages`
werden aus dem Paketeinstieg exportiert.

### Gemeinsamer Feldvertrag

`label` und `description` werden mit stabilen IDs gerendert und automatisch
über `aria-labelledby` beziehungsweise `aria-describedby` mit dem sichtbaren
Trigger verknüpft. Ein gesetztes `error` überschreibt die interne
Pflichtfeldmeldung; `error={null}` unterdrückt sie. `disabled` entfernt den
versteckten Formularwert aus Validierung und Submit, während `readOnly` den
Wert beibehält, aber Öffnen und Änderungen verhindert.
Weitere React-`aria-*`-Attribute werden direkt an den sichtbaren Trigger
weitergegeben; zustandsabhängige Werte werden dabei mit dem Feldzustand
zusammengeführt.

```tsx
<CustomCalendar
    id="appointment"
    name="appointment"
    label="Termin"
    description="Wähle einen verfügbaren Termin."
    error={serverError ?? undefined}
    aria-label="Termin auswählen"
    triggerRef={triggerRef}
/>
```

## Typisierte Single- und Range-APIs

Für neuen Code stehen `SingleCalendar` und `RangeCalendar` mit schmalen
Value- und Callback-Typen bereit. `CustomCalendar` bleibt als vollständig
kompatibler Einstieg für dynamische Modi und `switchMode` erhalten.

```tsx
import {
    RangeCalendar,
    SingleCalendar,
    type RangeCalendarValue,
    type SingleCalendarValue,
} from '@rentnerkev/calendar'

const [appointment, setAppointment] = useState<SingleCalendarValue>()
const [period, setPeriod] = useState<RangeCalendarValue>()

<SingleCalendar value={appointment} onChange={setAppointment} enableTime />
<RangeCalendar value={period} onChange={setPeriod} />
```

`parseCalendarValue` normalisiert einzelne Werte und Ranges. Dabei werden
ungültige Range-Grenzen zu `null`, während ein ungültiger Einzelwert
`undefined` ergibt. `serializeCalendarValue` erzeugt standardmäßig vollständige
UTC-ISO-Zeitstempel. Mit `{ format: 'date' }` entstehen lokale
Kalenderdatumswerte im Format `YYYY-MM-DD`.

```ts
const value = parseCalendarValue('21.09.2026 14:30')
const timestamp = serializeCalendarValue(value)
const dateOnly = serializeCalendarValue(value, { format: 'date' })

const range = parseCalendarValue(['2026-09-21', null])
if (isCalendarRange(range)) {
    const [from, to] = serializeCalendarValue(range)
}
```

`parseCalendarISODate` interpretiert `YYYY-MM-DD` bewusst als lokales
Kalenderdatum und verhindert dadurch Verschiebungen auf den Vortag.
`parseCalendarISOString` verarbeitet vollständige ISO-Zeitpunkte mit `Z` oder
Offset. Die Gegenstücke heißen `serializeCalendarISODate` und
`serializeCalendarISOString`. Ungültige Werte führen zu `undefined` und werfen
keinen `RangeError`.

## Hilfsfunktionen

Die Library exportiert nützliche Funktionen zur Arbeit mit Daten und zur Formatierung:

| Funktion                                  | Beschreibung                                                                                                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `formatCalendarValue(value, locale?)`     | Formatiert `Date` oder `Range` auf Deutsch oder Englisch zu einem lesbaren String.                                            |
| `parseCalendarValue(value)`               | Normalisiert Single-/Range-Eingaben und lehnt unmögliche Datumswerte ab.                                                      |
| `serializeCalendarValue(value, options?)` | Serialisiert Werte als ISO-Zeitpunkt oder lokales ISO-Kalenderdatum.                                                          |
| `isCalendarRange(value)`                  | Prüft typsicher auf eine gültige Calendar-Range.                                                                              |
| `parseCalendarISODate(value)`             | Liest ein striktes lokales `YYYY-MM-DD`-Kalenderdatum.                                                                        |
| `serializeCalendarISODate(value)`         | Schreibt ein Datum ohne UTC-Verschiebung als `YYYY-MM-DD`.                                                                    |
| `parseCalendarISOString(value)`           | Liest einen vollständigen ISO-Zeitpunkt mit Zone oder Offset.                                                                 |
| `serializeCalendarISOString(value)`       | Schreibt einen gültigen Zeitpunkt sicher mit `Date#toISOString()`.                                                            |
| `isSameDay(d1, d2)`                       | Prüft, ob zwei Daten der gleiche Kalendertag sind.                                                                            |
| `isToday(date)`                           | Prüft, ob das übergebene Datum der heutige Tag ist.                                                                           |
| `formatMonthName(date, locale?)`          | Gibt Monat und Jahr des Datums auf Deutsch oder Englisch formatiert zurück (z.B. "Januar 2024").                              |
| `getGermanHolidayName(date)`              | Prüft, ob ein Datum ein deutscher Feiertag ist, und gibt dessen Namen als String (z.B. "Silvester") zurück, andernfalls null. |

## Props (Typen)

### `CustomCalendar`

| Prop               | Typ                               | Standard         | Beschreibung                                                                                                      |
| ------------------ | --------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------- |
| `id`               | `string`                          | `undefined`      | ID für den sichtbaren Trigger, nützlich für Labels und Formularfelder.                                            |
| `name`             | `string`                          | `undefined`      | Name für Formular-Submit und native Pflichtfeld-Validierung.                                                      |
| `value`            | `CalendarInputValue`              | `undefined`      | Das aktuell ausgewählte Datum oder die Range. Unterstützt `Date`, `string` (ISO/Deutsch), `number` (Timestamp).   |
| `onChange`         | `(value: CalendarValue) => void`  | -                | Callback bei Änderung des Wertes.                                                                                 |
| `required`         | `boolean`                         | `false`          | Aktiviert Pflichtfeld-Validierung. Ohne Auswahl wird der Trigger beim Submit rot und zeigt den Fehler im Tooltip. |
| `label`            | `ReactNode`                       | `undefined`      | Sichtbare Feldbezeichnung mit stabiler ID und automatischer `aria-labelledby`-Verknüpfung.                        |
| `description`      | `ReactNode`                       | `undefined`      | Hilfetext mit stabiler ID, der in `aria-describedby` einfließt.                                                   |
| `error`            | `string \| null`                  | `undefined`      | Externer Fehler. Überschreibt die interne Validierung; `null` unterdrückt diese.                                  |
| `disabled`         | `boolean`                         | `false`          | Deaktiviert Interaktion und verstecktes Formularfeld; der Wert wird nicht validiert oder submitted.               |
| `readOnly`         | `boolean`                         | `false`          | Verhindert Öffnen und Änderungen, der Formularwert bleibt erhalten.                                               |
| `triggerRef`       | `Ref<HTMLDivElement>`             | `undefined`      | Ref auf den sichtbaren Trigger, der bei nativem Invalid-Submit fokussiert wird.                                   |
| `aria-label`       | `string`                          | `undefined`      | Zusätzliche oder alternative zugängliche Beschriftung des Triggers.                                               |
| `aria-labelledby`  | `string`                          | `undefined`      | Zusätzliche Beschriftungs-IDs; sie werden mit der Label-ID zusammengeführt.                                       |
| `aria-describedby` | `string`                          | `undefined`      | Zusätzliche Beschreibungs-IDs; sie werden mit Beschreibung und Fehler zusammengeführt.                            |
| `enableTime`       | `boolean`                         | `false`          | Aktiviert die Zeitauswahl unter dem Kalendergrid.                                                                 |
| `enableRange`      | `boolean`                         | `false`          | Aktiviert die Auswahl eines Zeitraums (Start- und Enddatum).                                                      |
| `customDesign`     | `CalendarCustomDesign`            | `defaultDesign`  | Objekt zur individuellen Gestaltung des Designs.                                                                  |
| `placeholder`      | `string`                          | "Klicke hier..." | Platzhalter-Text im Input-Feld.                                                                                   |
| `button`           | `boolean`                         | `false`          | Zeigt einen "Anwenden"-Button im Popover an.                                                                      |
| `backdrop`         | `boolean`                         | `true`           | Schließt das Popover beim Klick außerhalb (Overlay).                                                              |
| `icon`             | `ReactNode \| boolean`            | `CalendarDays`   | Icon links im Input. Kann ein React-Element sein oder `false`, um das Icon komplett auszublenden.                 |
| `className`        | `string`                          | `""`             | Zusätzliche CSS-Klassen für den äußeren Container. Bestimmt auch den Radius des Popovers.                         |
| `closeOnSelect`    | `boolean`                         | `false`          | Schließt das Popover automatisch, sobald ein Datum (oder eine vollständige Range) gewählt wurde.                  |
| `minDate`          | `CalendarInputValue`              | `undefined`      | Begrenzt die Auswahl auf Daten ab (inklusive) diesem Datum.                                                       |
| `maxDate`          | `CalendarInputValue`              | `undefined`      | Begrenzt die Auswahl auf Daten bis (inklusive) diesem Datum.                                                      |
| `minTime`          | `string`                          | `undefined`      | Früheste wählbare Uhrzeit im Format "HH:mm".                                                                      |
| `maxTime`          | `string`                          | `undefined`      | Späteste wählbare Uhrzeit im Format "HH:mm".                                                                      |
| `fastEdit`         | `boolean`                         | `true`           | Zeigt im Header schnelle Monat- und Jahr-Selects für größere Datumssprünge.                                       |
| `weekStartsOn`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7` | `1`              | Definiert den Start der Woche (1 = Montag, 7 = Sonntag).                                                          |
| `visibleDays`      | `number`                          | `7`              | Anzahl der sichtbaren Tage pro Woche im Grid.                                                                     |
| `showHolidays`     | `boolean`                         | `false`          | Markiert deutsche gesetzliche Feiertage mit einem Punkt und Tooltip.                                              |
| `locale`           | `'de' \| 'en'`                    | `'de'`           | Sprache für UI-, Validierungs- und ARIA-Texte sowie die Datumsformatierung.                                       |
| `messages`         | `Partial<CalendarMessages>`       | `undefined`      | Überschreibt einzelne Texte des gewählten Sprachkatalogs.                                                         |
| `switchMode`       | `boolean`                         | `false`          | Erlaubt es dem Nutzer, im Interface zwischen Einzeldatum- und Zeitraums-Modus zu wechseln.                        |
| `isDeletatable`    | `boolean`                         | `false`          | Fügt einen Button hinzu, um den ausgewählten Wert zu löschen (null).                                              |

## CSS-Konfiguration

Der Kalender liefert einen eigenen Tailwind-Einstieg. Importiere ihn nach Tailwind CSS in deine Haupt-CSS-Datei:

```css
@import 'tailwindcss';
@import '@rentnerkev/calendar/tailwind.css';
```

Der Paket-Einstieg scannt ausschließlich die veröffentlichten JavaScript-Dateien
unter `dist`. Er stellt die gemeinsamen Theme-Tokens `primary`, `primary-hover`,
`background-dark`, `surface-dark`, `input-dark`, `border-dark`, `secondary-text`
und `muted-foreground` bereit. Eigene Werte können danach mit einem weiteren
`@theme`-Block überschrieben werden.

## Entwicklung

```bash
bun install
bun run verify
bun run playground:dev
```

`bun run verify` prüft Typen, Oxlint, Oxfmt, den Paket-Build und den
veröffentlichten Paketinhalt per Dry Run.
