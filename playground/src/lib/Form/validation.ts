import type { CalendarValue } from '../../../../src/shared/Calendar/Types/Calendar.types.ts'
export const requiredValidator =
    (label: string) =>
    ({ value }: { value: string }) =>
        value.trim().length === 0 ? `${label} ist erforderlich.` : undefined

export const requiredCalendarValidator = ({
    value,
}: {
    value: CalendarValue
}) => (value ? undefined : 'Termin ist erforderlich.')
