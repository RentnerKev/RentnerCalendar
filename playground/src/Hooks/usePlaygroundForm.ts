import { useForm } from '@tanstack/react-form'
import type { PlaygroundFormValues } from '../Types/Playground.types.ts'
export function usePlaygroundForm(
    setSubmittedValues: (value: PlaygroundFormValues) => void,
) {
    const form = useForm({
        defaultValues: {
            firstName: '',
            email: '',
            appointment: undefined,
            message: '',
        } as PlaygroundFormValues,
        onSubmit: ({ value }) => {
            setSubmittedValues(value)
        },
    })

    return form
}
