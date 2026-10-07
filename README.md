<p align="center">
    <img src="https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/banner.png" alt="RentnerCalendar" width="100%">
</p>

<p align="center">
    <a href="https://github.com/RentnerKev/RentnerCalendar/actions/workflows/ci.yml"><img src="https://github.com/RentnerKev/RentnerCalendar/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
    <a href="https://github.com/RentnerKev/RentnerCalendar/actions/workflows/codeql.yml"><img src="https://github.com/RentnerKev/RentnerCalendar/actions/workflows/codeql.yml/badge.svg?branch=main" alt="CodeQL"></a>
    <a href="https://www.npmjs.com/package/@rentnerkev/calendar"><img src="https://img.shields.io/npm/v/@rentnerkev/calendar" alt="npm version"></a>
    <a href="https://www.npmjs.com/package/@rentnerkev/calendar"><img src="https://img.shields.io/npm/dm/@rentnerkev/calendar" alt="npm downloads"></a>
    <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT license"></a>
</p>

Controlled single dates and ranges, time selection, localization and Tailwind design hooks.

## Installation

Requires React 19, React DOM 19 and Tailwind CSS 4.

```bash
bun add @rentnerkev/calendar
# npm alternative
npm install @rentnerkev/calendar
```

Import the package styles in your Tailwind stylesheet:

```css
@import 'tailwindcss';
@import '@rentnerkev/calendar/tailwind.css';
```

## Quick start

```tsx
'use client'

import { useState } from 'react'
import { SingleCalendar, type SingleCalendarValue } from '@rentnerkev/calendar'

export function Appointment() {
    const [value, setValue] = useState<SingleCalendarValue>()

    return (
        <SingleCalendar
            label="Appointment"
            locale="en"
            value={value}
            onChange={setValue}
        />
    )
}
```

## Screenshots

| Single date selection                                                                                                                                                                                                                                                     | Date range selection                                                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Single date selection](https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/screenshots/single-date-selection.png)](https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/screenshots/single-date-selection.png)  | [![Date range selection](https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/screenshots/date-range-selection.png)](https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/screenshots/date-range-selection.png)                          |
| **English dates and time**                                                                                                                                                                                                                                                | **Searchable month navigation**                                                                                                                                                                                                                                                                |
| [![English dates and time](https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/screenshots/english-date-and-time.png)](https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/screenshots/english-date-and-time.png) | [![Searchable month navigation](https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/screenshots/month-navigation-and-holidays.png)](https://raw.githubusercontent.com/RentnerKev/RentnerCalendar/main/assets/readme/screenshots/month-navigation-and-holidays.png) |

[Full API and usage guide](https://github.com/RentnerKev/RentnerCalendar/blob/main/docs/usage.md) · [Local Playground](./playground) · [MIT license](./LICENSE)

Run the Playground from the repository root:

```bash
bun install --cwd playground
bun run playground:dev
```
