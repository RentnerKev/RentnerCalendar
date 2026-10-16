import { expect, test } from 'bun:test'
import { getCalendarFieldProps } from '../form.ts'

test('connects direct values, blur and readable external errors without a UI dependency', () => {
    let value: string | undefined
    let blurred = false
    const field = {
        name: 'date',
        state: {
            value,
            meta: {
                isTouched: false,
                errors: ['Required', { message: 'Invalid' }, { code: 1 }],
            },
        },
        handleChange(next: string | undefined) {
            value = next
        },
        handleBlur() {
            blurred = true
        },
    }
    const props = getCalendarFieldProps(field)
    expect(props.name).toBe('date')
    expect(props.value).toBeUndefined()
    expect(props.error).toBeUndefined()
    props.onChange('2026-10-16')
    props.onBlur()
    expect(value).toBe('2026-10-16')
    expect(blurred).toBe(true)
    expect(getCalendarFieldProps(field, { showErrors: 'always' }).error).toBe(
        'Required · Invalid',
    )
    expect(
        getCalendarFieldProps(field, {
            showErrors: true,
            mapError: () => 'Mapped',
        }).error,
    ).toBe('Mapped · Mapped · Mapped')
})
