import type { RangeCalendarValue } from '../../../../src/shared/Calendar/Types/Calendar.types.ts'
const pad = (value: number) => String(value).padStart(2, '0')

export function formatLocalDateTime(date: Date | null | undefined) {
    if (!date) return ''

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function formatRange(value: RangeCalendarValue) {
    return value
        ? `${formatLocalDateTime(value[0])}|${formatLocalDateTime(value[1])}`
        : ''
}
