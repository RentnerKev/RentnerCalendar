import { createRoot } from 'react-dom/client'
import { CustomCalendar } from '../../src/Calendar.js'
import { formatCalendarValue } from '../../src/Tools/FormatFunctions.js'
// oxlint-disable-next-line import/no-unassigned-import -- Playground CSS entry.
import './index.css'

const shadow = document
    .getElementById('shadow-host')!
    .attachShadow({ mode: 'open' })
for (const locale of ['de', 'en'] as const) {
    document.getElementById('shadow-host')!.dataset[locale] =
        formatCalendarValue(new Date(2026, 9, 7, 13, 30), locale)
}
const mount = document.createElement('div')
shadow.append(mount)
createRoot(mount).render(
    <CustomCalendar
        id="shadow-calendar"
        backdrop={false}
        value={new Date(2026, 9, 7)}
    />,
)
