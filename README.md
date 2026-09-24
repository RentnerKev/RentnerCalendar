# @rentnerkev/calendar

A controlled React date picker for single dates and ranges, with optional time
input, native form validation, localization, and customizable Tailwind styling.

## Requirements

Use React 19 with React DOM 19, an ESM-capable build, and Tailwind CSS 4 for
the documented styling. Import this package's `tailwind.css` entry into your
Tailwind stylesheet. It uses `@source` for published classes and `@theme` for
global tokens such as `--color-primary`. Check for token name collisions with
your app and override them in a later `@theme` block if needed.

In a React Server Components app, import and render the calendar from a module
beginning with `'use client'`; define its state and callbacks there. See the
[Tailwind directives](https://tailwindcss.com/docs/functions-and-directives)
and [React client boundary](https://react.dev/reference/rsc/use-client) guides.

## Installation

With npm:

```bash
npm install @rentnerkev/calendar
```

Or with Bun:

```bash
bun add @rentnerkev/calendar
```

## Quick start

Use `SingleCalendar` or `RangeCalendar` for new code. Their value and callback
types stay narrow and do not require casts.

```tsx
import { useState } from 'react'
import { SingleCalendar, type SingleCalendarValue } from '@rentnerkev/calendar'

export function AppointmentField() {
    const [appointment, setAppointment] = useState<SingleCalendarValue>()

    return (
        <SingleCalendar
            id="appointment"
            name="appointment"
            label="Appointment"
            value={appointment}
            onChange={setAppointment}
            placeholder="Choose a date"
            required
        />
    )
}
```

`CustomCalendar` remains available for backward compatibility, dynamic modes,
and interfaces that let users switch between single-date and range selection.

## Single dates and ranges

```tsx
import { useState } from 'react'
import {
    RangeCalendar,
    SingleCalendar,
    type RangeCalendarValue,
    type SingleCalendarValue,
} from '@rentnerkev/calendar'

export function CalendarFields() {
    const [appointment, setAppointment] = useState<SingleCalendarValue>()
    const [period, setPeriod] = useState<RangeCalendarValue>()

    return (
        <>
            <SingleCalendar
                value={appointment}
                onChange={setAppointment}
                enableTime
            />
            <RangeCalendar value={period} onChange={setPeriod} />
        </>
    )
}
```

Selections commit immediately when `button` is `false`. `backdrop` only
controls outside-click behavior, while `closeOnSelect` only controls whether a
completed selection closes the popover. When `button` is `true`, the Apply
button commits the pending value.

## Form and accessibility contract

`label` and `description` receive stable IDs and are connected to the visible
trigger through `aria-labelledby` and `aria-describedby`. An external `error`
overrides internal validation; `error={null}` explicitly clears it. Additional
React `aria-*` attributes are forwarded to the trigger and merged with the
component state.

On an invalid native submit, the visible trigger receives focus. A disabled
calendar is excluded from validation and form submission. A read-only calendar
keeps its form value but prevents opening and changes.

By default, native form submission uses the localized display text for
compatibility. Pass `getFormValue` to define a backend format without changing
the visible text. For a single date, the existing ISO helper returns a local
`YYYY-MM-DD` value:

```tsx
import { serializeCalendarISODate, SingleCalendar } from '@rentnerkev/calendar'

;<SingleCalendar
    name="appointment"
    value={appointment}
    onChange={setAppointment}
    getFormValue={(value) =>
        value instanceof Date ? (serializeCalendarISODate(value) ?? '') : ''
    }
/>
```

Range mode still submits one field. Use `getFormValue` to encode both bounds in
the format your backend expects, such as a JSON array of ISO dates.

```tsx
<SingleCalendar
    id="appointment"
    name="appointment"
    label="Appointment"
    description="Choose an available time slot."
    error={serverError ?? undefined}
    aria-label="Choose an appointment"
    triggerRef={triggerRef}
    required
/>
```

## Full configuration example

```tsx
import { Clock } from 'lucide-react'
import { useState } from 'react'
import {
    CustomCalendar,
    type CalendarCustomDesign,
    type CalendarValue,
} from '@rentnerkev/calendar'

const calendarDesign: CalendarCustomDesign = {
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    surfaceBackground: 'bg-slate-900',
    borderColor: 'border-slate-700',
}

export function BookingRange() {
    const [value, setValue] = useState<CalendarValue>([new Date(), null])

    return (
        <CustomCalendar
            id="booking-range"
            name="bookingRange"
            value={value}
            onChange={setValue}
            required
            enableRange
            enableTime
            button
            backdrop
            customDesign={calendarDesign}
            icon={<Clock size={16} />}
            placeholder="Choose a period"
            className="h-20 w-120 rounded-lg"
            closeOnSelect
            minDate={new Date()}
            maxDate={new Date('2026-12-31')}
            minTime="08:00"
            maxTime="18:00"
            weekStartsOn={1}
            visibleDays={5}
            showHolidays
            switchMode
            isDeletable
        />
    )
}
```

## Value parsing and serialization

`parseCalendarValue` normalizes single values and ranges. Invalid range bounds
become `null`; an invalid single value becomes `undefined`.
`serializeCalendarValue` returns full UTC ISO timestamps by default. Pass
`{ format: 'date' }` to produce local `YYYY-MM-DD` calendar dates.

```ts
import {
    isCalendarRange,
    parseCalendarValue,
    serializeCalendarValue,
} from '@rentnerkev/calendar'

const value = parseCalendarValue('2026-09-21T14:30:00+02:00')
const timestamp = serializeCalendarValue(value)
const dateOnly = serializeCalendarValue(value, { format: 'date' })

const range = parseCalendarValue(['2026-09-21', null])
if (isCalendarRange(range)) {
    const [from, to] = serializeCalendarValue(range)
}
```

`parseCalendarISODate` treats `YYYY-MM-DD` as a local calendar date and avoids
an accidental shift to the previous day. `parseCalendarISOString` accepts a
full timestamp with a zone or offset. Their counterparts are
`serializeCalendarISODate` and `serializeCalendarISOString`. Invalid values
return `undefined` instead of throwing a `RangeError`.

## Localization and messages

German remains the default for backward compatibility. Set `locale="en"` for
the complete English UI, validation, ARIA text, and date formatting. Override
individual messages with a typed `Partial<CalendarMessages>` object.

```tsx
<SingleCalendar
    locale="en"
    messages={{
        apply: 'Save',
        required: 'Please choose a date',
    }}
/>
```

`CalendarMessages`, `calendarMessageCatalog`, and `resolveCalendarMessages`
are available from the root entry and `@rentnerkev/calendar/messages`.

## Utilities

| Function                                  | Description                                                       |
| ----------------------------------------- | ----------------------------------------------------------------- |
| `formatCalendarValue(value, locale?)`     | Formats a date or range as readable German or English text.       |
| `parseCalendarValue(value)`               | Normalizes single and range input and rejects impossible dates.   |
| `serializeCalendarValue(value, options?)` | Serializes values as timestamps or local calendar dates.          |
| `isCalendarRange(value)`                  | Type-safe guard for valid calendar ranges.                        |
| `parseCalendarISODate(value)`             | Reads a strict local `YYYY-MM-DD` date.                           |
| `serializeCalendarISODate(value)`         | Writes a date as `YYYY-MM-DD` without a UTC shift.                |
| `parseCalendarISOString(value)`           | Reads a complete timestamp with a zone or offset.                 |
| `serializeCalendarISOString(value)`       | Safely writes a valid timestamp with `Date#toISOString()`.        |
| `isSameDay(first, second)`                | Checks whether two inputs represent the same local calendar day.  |
| `isToday(value)`                          | Checks whether an input represents today.                         |
| `formatMonthName(date, locale?)`          | Formats a month and year in German or English.                    |
| `getGermanHolidayName(date)`              | Returns the German name of a supported German holiday, or `null`. |

Date helpers are also available from `@rentnerkev/calendar/date`; parsing and
serialization helpers are available from `@rentnerkev/calendar/value`.

## Custom design

Pass `customDesign` to override individual Tailwind classes.

```tsx
import type { CalendarCustomDesign } from '@rentnerkev/calendar'

const customDesign: CalendarCustomDesign = {
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    surfaceBackground: 'bg-slate-900',
    borderColor: 'border-slate-700',
}
```

Common design fields include:

| Field               | Description                           |
| ------------------- | ------------------------------------- |
| `primaryColor`      | Primary text color class.             |
| `primaryBg`         | Selected-day background class.        |
| `primaryHover`      | Hover background class for buttons.   |
| `primaryBorder`     | Active-state border class.            |
| `primaryRing`       | Focus-ring class.                     |
| `surfaceBackground` | Popover background class.             |
| `inputBackground`   | Trigger background class.             |
| `borderColor`       | Default border class.                 |
| `textColor`         | Main text class.                      |
| `textMuted`         | Secondary text class.                 |
| `textMutedDark`     | Lower-emphasis text class.            |
| `textDay`           | Weekday and calendar-grid text class. |
| `hoverBackground`   | Day hover background class.           |

See the `CalendarCustomDesign` type for the complete list.

## `CustomCalendar` props

| Prop               | Type                               | Default        | Description                                                |
| ------------------ | ---------------------------------- | -------------- | ---------------------------------------------------------- |
| `id`               | `string`                           | `undefined`    | ID for the visible trigger.                                |
| `name`             | `string`                           | `undefined`    | Native form field name.                                    |
| `value`            | `CalendarInputValue`               | `undefined`    | Controlled date or range value.                            |
| `onChange`         | `(value: CalendarValue) => void`   | –              | Receives committed value changes exactly once.             |
| `getFormValue`     | `(value: CalendarValue) => string` | `undefined`    | Optional native form serializer; defaults to display text. |
| `required`         | `boolean`                          | `false`        | Enables native required validation.                        |
| `label`            | `ReactNode`                        | `undefined`    | Visible, accessible field label.                           |
| `description`      | `ReactNode`                        | `undefined`    | Help text included in `aria-describedby`.                  |
| `error`            | `string \| null`                   | `undefined`    | External error; `null` clears validation errors.           |
| `disabled`         | `boolean`                          | `false`        | Disables interaction and form submission.                  |
| `readOnly`         | `boolean`                          | `false`        | Prevents changes while retaining the form value.           |
| `triggerRef`       | `Ref<HTMLDivElement>`              | `undefined`    | Ref to the focusable visible trigger.                      |
| `aria-label`       | `string`                           | `undefined`    | Alternative accessible trigger label.                      |
| `aria-labelledby`  | `string`                           | `undefined`    | Additional accessible label IDs.                           |
| `aria-describedby` | `string`                           | `undefined`    | Additional description IDs.                                |
| `enableTime`       | `boolean`                          | `false`        | Enables time selection.                                    |
| `enableRange`      | `boolean`                          | `false`        | Enables range selection.                                   |
| `customDesign`     | `CalendarCustomDesign`             | Default design | Overrides design classes.                                  |
| `placeholder`      | `string`                           | Localized      | Trigger placeholder.                                       |
| `button`           | `boolean`                          | `false`        | Requires the Apply button to commit changes.               |
| `backdrop`         | `boolean`                          | `true`         | Enables closing on an outside click.                       |
| `icon`             | `ReactNode \| boolean`             | `CalendarDays` | Custom icon, or `false` to hide it.                        |
| `className`        | `string`                           | `''`           | Additional outer-container classes.                        |
| `closeOnSelect`    | `boolean`                          | `false`        | Closes after a completed selection.                        |
| `minDate`          | `CalendarInputValue`               | `undefined`    | Inclusive minimum selectable date.                         |
| `maxDate`          | `CalendarInputValue`               | `undefined`    | Inclusive maximum selectable date.                         |
| `minTime`          | `string`                           | `undefined`    | Earliest selectable `HH:mm` time.                          |
| `maxTime`          | `string`                           | `undefined`    | Latest selectable `HH:mm` time.                            |
| `fastEdit`         | `boolean`                          | `true`         | Shows fast month and year controls.                        |
| `weekStartsOn`     | `1 \| 2 \| 3 \| 4 \| 5 \| 6 \| 7`  | `1`            | First weekday, Monday through Sunday.                      |
| `visibleDays`      | `number`                           | `7`            | Number of visible days per week.                           |
| `showHolidays`     | `boolean`                          | `false`        | Marks supported German holidays.                           |
| `locale`           | `'de' \| 'en'`                     | `'de'`         | UI, validation, ARIA, and formatting locale.               |
| `messages`         | `Partial<CalendarMessages>`        | `undefined`    | Overrides localized messages.                              |
| `switchMode`       | `boolean`                          | `false`        | Lets users switch between single and range modes.          |
| `isDeletable`      | `boolean`                          | `false`        | Adds a button that clears the selected value.              |

## Tailwind CSS

Import the package entry after Tailwind CSS in your main stylesheet:

```css
@import 'tailwindcss';
@import '@rentnerkev/calendar/tailwind.css';
```

The entry scans only published JavaScript under `dist`. It provides the shared
`primary`, `primary-hover`, `background-dark`, `surface-dark`, `input-dark`,
`border-dark`, `secondary-text`, and `muted-foreground` theme tokens. Override
them with a later `@theme` block when needed.

## Public entry points

- `@rentnerkev/calendar`
- `@rentnerkev/calendar/calendar`
- `@rentnerkev/calendar/single-calendar`
- `@rentnerkev/calendar/range-calendar`
- `@rentnerkev/calendar/value`
- `@rentnerkev/calendar/format`
- `@rentnerkev/calendar/date`
- `@rentnerkev/calendar/messages`
- `@rentnerkev/calendar/types`
- `@rentnerkev/calendar/tailwind.css`

## Development

```bash
bun install --frozen-lockfile
bun install --cwd playground --frozen-lockfile
bun run verify
bun run test:e2e
bun run playground:build
```

`bun run verify` checks types, Oxlint, Oxfmt, tests, the package build, and the
published package contents.

## License

MIT
