export interface CalendarFormField<Value> {
    name: string
    state: {
        value: Value
        meta: { errors: readonly unknown[]; isTouched: boolean }
    }
    handleChange: (value: Value) => void
    handleBlur: () => void
}

export interface CalendarFormOptions {
    showErrors?: boolean | 'always' | 'touched'
    mapError?: (error: unknown) => string | undefined
}

export function getCalendarFieldProps<Value>(
    field: CalendarFormField<Value>,
    options: CalendarFormOptions = {},
) {
    const visible =
        options.showErrors === true ||
        options.showErrors === 'always' ||
        ((options.showErrors ?? 'touched') === 'touched' &&
            field.state.meta.isTouched)
    const mapError = options.mapError ?? readableCalendarError
    const error = visible
        ? field.state.meta.errors
              .map(mapError)
              .filter((message): message is string => Boolean(message))
              .join(' · ')
        : ''
    return {
        name: field.name,
        value: field.state.value,
        onChange: (value: Value) => field.handleChange(value),
        onBlur: () => field.handleBlur(),
        error: error || undefined,
    }
}

function readableCalendarError(error: unknown): string | undefined {
    if (typeof error === 'string') return error
    if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof error.message === 'string'
    )
        return error.message
    return undefined
}
