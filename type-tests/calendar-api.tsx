import {
    CalendarProvider,
    RangeCalendar,
    SingleCalendar,
} from '../src/index.js'
import type { CalendarRange } from '../src/index.js'

const single = (
    <SingleCalendar
        value={new Date(2026, 8, 21)}
        formValueFormat="iso-date"
        getFormValue={(date) => date.toISOString()}
        onBlur={(event) => void event.currentTarget.id}
    />
)

const range = (
    <RangeCalendar
        value={[new Date(2026, 8, 21), null]}
        formValueFormat="iso-date"
        getFormValue={(bounds) =>
            bounds.map((date) => date?.toISOString() ?? '').join('/')
        }
    />
)

const invalidSingle = (
    // @ts-expect-error The single serializer receives a Date, not a range.
    <SingleCalendar getFormValue={(_bounds: CalendarRange) => ''} />
)

const invalidRange = (
    // @ts-expect-error The range serializer receives a tuple, not a Date.
    <RangeCalendar getFormValue={(_date: Date) => ''} />
)

const withDefaults = (
    <CalendarProvider
        locale="en"
        customDesign={{ inputBackground: 'bg-slate-900' }}
        messages={{ placeholder: 'Choose a date' }}
    >
        <SingleCalendar />
        <RangeCalendar locale="de" />
    </CalendarProvider>
)

void [single, range, invalidSingle, invalidRange, withDefaults]
