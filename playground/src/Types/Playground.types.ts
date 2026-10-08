import type { FormEvent } from 'react'
import type { CalendarValue } from '../../../src/shared/Calendar/Types/Calendar.types.ts'
import type { usePlaygroundForm } from '../Hooks/usePlaygroundForm.ts'
export type PlaygroundFormValues = {
    firstName: string
    email: string
    appointment: CalendarValue
    message: string
}
export type PlaygroundLogicResult = {
    state: {
        isPopoverWidthTest: boolean
        isReadonlyAxeTest: boolean
        submittedValues: PlaygroundFormValues | null
        calendarMinDate: Date | undefined
        calendarShadowClass: boolean
        calendarWidthUtility: 'none' | 'typed' | 'responsive'
    }
    handler: {
        handleSubmit: (event: FormEvent<HTMLFormElement>) => void
        handleSetValue: () => void
        handleSetMinimum: () => void
        handleSetLaterMinimum: () => void
        handleToggleShadow: () => void
        handleCycleWidth: () => void
    }
    form: ReturnType<typeof usePlaygroundForm>
}

export type FieldErrorProps = { errors: unknown[] }
