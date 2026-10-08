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
npm install @rentnerkev/calendar
# or with Bun
bun add @rentnerkev/calendar
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

[Full API and usage guide](https://npm.rentner.dev/docs/calendar) · [Local Playground](./playground) · [MIT license](./LICENSE)

Run the Playground from the repository root:

```bash
bun install --cwd playground
bun run playground:dev
```

## AI and read-only MCP access

The separate `@rentnerkev/calendar/ai` entry is for Node.js and Bun tooling. It reads
only this installed package's manifest, README, usage guide, and built TypeScript
declarations. It does not import React, mount UI, run examples, perform network
requests, or require an MCP runtime. Keep it in server/tooling code.

```ts
import {
    getPackageInfo,
    getPackageApi,
    getPackageDocumentation,
    searchPackageDocumentation,
    getPackageExamples,
} from '@rentnerkev/calendar/ai'

const info = getPackageInfo()
const api = getPackageApi() // All public typed subpaths and dependent declarations
const usage = getPackageDocumentation('usage') // Full guide, including CSS and providers
const readme = getPackageDocumentation('readme')
const matches = searchPackageDocumentation('messages') // Literal, case-insensitive lines
const examples = getPackageExamples() // Fenced examples from the usage guide
```

`getPackageApi({ subpath: '.', symbol: 'CustomCalendar' })` validates the symbol
against the selected public entry and returns its complete declaration context.
Unknown subpaths or symbols throw an error. File paths are not accepted. The
`./ai` entry itself is excluded from this UI API context. The manifest's `exports`
map remains available through `getPackageInfo()`.

Public website discovery is planned at
[llms.txt](https://packages.rentner.dev/llms.txt) and
[the MCP endpoint](https://packages.rentner.dev/mcp). These addresses become
available after the website deployment; this documentation does not claim the
endpoint is already online. The website's read-only tools expose public package
information, API declarations, usage guides, examples, and search, without
accounts, write operations, or access to private project files. The installed
`/ai` entry works locally without that service. Always use the documentation and
declarations for the version installed in your project.
