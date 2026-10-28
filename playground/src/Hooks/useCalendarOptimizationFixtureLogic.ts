import { useLayoutEffect, useState } from 'react'
import { flushSync } from 'react-dom'
import useCalendarHeaderLogic from '../../../src/shared/Calendar/Hooks/useCalendarHeaderLogic.ts'
import { resolveCalendarMessages } from '../../../src/lib/Calendar/messages.ts'
import type { CalendarHeaderLogicResult } from '../../../src/shared/Calendar/Types/CalendarHeaderLogicResult.types.ts'
import type { Option } from '../../../src/shared/Calendar/Types/InternalSelect.types.ts'
import type { CalendarOptimizationAction } from '../Types/CalendarOptimizationFixture.types.ts'

let latestHeader: CalendarHeaderLogicResult['state']
let capturedHeader: CalendarHeaderLogicResult['state']
let dispatch: (action: CalendarOptimizationAction) => void
let labelReads = 0
let stopCounting: (() => void) | undefined

export function captureHeaderReferences() {
    capturedHeader = latestHeader
}

export function readHeaderProbe() {
    return {
        sameYears: latestHeader.yearOptions === capturedHeader.yearOptions,
        sameMonths: latestHeader.monthOptions === capturedHeader.monthOptions,
        currentYear: latestHeader.currentYear,
        currentMonth: latestHeader.currentMonth,
        firstYear: latestHeader.yearOptions[0].value,
        lastYear: latestHeader.yearOptions.at(-1)!.value,
        monthLabels: latestHeader.monthOptions.map((option) => option.label),
    }
}

export function runFixtureAction(action: CalendarOptimizationAction) {
    flushSync(() => dispatch(action))
}

export function countLabelNormalization() {
    if (!stopCounting) {
        const lowerCase = String.prototype.toLowerCase
        // oxlint-disable-next-line no-extend-native -- Isolated browser operations probe, restored on fixture unmount; only fixture labels are counted.
        String.prototype.toLowerCase = function () {
            if (String(this).startsWith('Probe label ')) labelReads++
            return lowerCase.call(this)
        }
        stopCounting = () => {
            // oxlint-disable-next-line no-extend-native -- Restore the exact original method after the isolated probe.
            String.prototype.toLowerCase = lowerCase
            stopCounting = undefined
        }
    }
    labelReads = 0
}

export function readLabelNormalization() {
    return labelReads
}

function ignoreViewDate() {}

export function useCalendarOptimizationFixtureLogic() {
    const [tick, setTick] = useState(0)
    const [date, setDate] = useState(() => new Date(2030, 0, 15, 12))
    const [months, setMonths] = useState(() => [
        ...resolveCalendarMessages('de').months,
    ])
    const [locale, setLocale] = useState<'de' | 'en'>('de')
    const [value, setValue] = useState('')
    const [options, setOptions] = useState<Option[]>(() => [
        {
            label: 'Probe label ALPHA',
            value: 'alpha',
            subOption: 'First family',
        },
        {
            label: 'Probe label BETA',
            value: 'beta',
            subOption: 'Second family',
        },
        {
            label: 'Probe label GAMMA',
            value: 'gamma',
            subOption: 'Third family',
        },
    ])
    const messages = resolveCalendarMessages(locale, { months })
    const header = useCalendarHeaderLogic({
        dialogId: 'optimization-header',
        currentDate: date,
        onPrevMonth: ignoreViewDate,
        onNextMonth: ignoreViewDate,
        onViewDateChange: ignoreViewDate,
        messages,
    })
    useLayoutEffect(() => {
        latestHeader = header.state
        dispatch = (action) => {
            switch (action) {
                case 'tick':
                    break
                case 'same-date':
                    setDate(new Date(date))
                    break
                case 'mutate-year':
                    date.setFullYear(date.getFullYear() + 1)
                    break
                case 'mutate-month':
                    months[0] = 'Januar geändert'
                    break
                case 'clone-months':
                    setMonths([...months])
                    break
                case 'english':
                    setLocale('en')
                    setMonths([...resolveCalendarMessages('en').months])
                    break
                case 'reorder-options':
                    options.reverse()
                    break
                case 'mutate-option':
                    options[0].label = 'Probe label MUTATED'
                    options[0].value = 'mutated'
                    options[0].subOption = 'Changed family'
                    break
                case 'replace-options':
                    setOptions([
                        {
                            label: 'Probe label NEW',
                            value: 'new',
                            subOption: 'Replacement family',
                        },
                        { label: 'Probe label OTHER', value: 'other' },
                    ])
                    break
            }
            setTick((previous) => previous + 1)
        }
    })
    useLayoutEffect(() => () => stopCounting?.(), [])
    return {
        state: { tick, options, value, messages, header: header.state },
        handler: { setValue },
    }
}
