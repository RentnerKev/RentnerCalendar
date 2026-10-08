import { useState } from 'react'
import type { FormEvent } from 'react'
import { usePlaygroundForm } from './usePlaygroundForm.ts'
import type {
    PlaygroundFormValues,
    PlaygroundLogicResult,
} from '../Types/Playground.types.ts'
export function usePlaygroundLogic(): PlaygroundLogicResult {
    const isPopoverWidthTest = new URLSearchParams(window.location.search).has(
        'calendar-width-test',
    )
    const isReadonlyAxeTest = new URLSearchParams(window.location.search).has(
        'calendar-readonly-test',
    )
    const [submittedValues, setSubmittedValues] =
        useState<PlaygroundFormValues | null>(null)
    const [calendarMinDate, setCalendarMinDate] = useState<Date | undefined>()
    const [calendarShadowClass, setCalendarShadowClass] = useState(false)
    const [calendarWidthUtility, setCalendarWidthUtility] = useState<
        'none' | 'typed' | 'responsive'
    >('none')

    const form = usePlaygroundForm(setSubmittedValues)
    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        event.stopPropagation()
        void form.handleSubmit()
    }
    function handleSetValue() {
        form.setFieldValue('appointment', new Date(2030, 11, 24, 12, 0))
    }
    function handleSetMinimum() {
        setCalendarMinDate(new Date(2030, 11, 25))
    }
    function handleSetLaterMinimum() {
        setCalendarMinDate(new Date(2031, 1, 1))
    }
    function handleToggleShadow() {
        setCalendarShadowClass((value) => !value)
    }
    function handleCycleWidth() {
        setCalendarWidthUtility((value) =>
            value === 'none'
                ? 'typed'
                : value === 'typed'
                  ? 'responsive'
                  : 'none',
        )
    }
    return {
        state: {
            isPopoverWidthTest,
            isReadonlyAxeTest,
            submittedValues,
            calendarMinDate,
            calendarShadowClass,
            calendarWidthUtility,
        },
        handler: {
            handleSubmit,
            handleSetValue,
            handleSetMinimum,
            handleSetLaterMinimum,
            handleToggleShadow,
            handleCycleWidth,
        },
        form,
    }
}
