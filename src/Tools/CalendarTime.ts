export interface CalendarTimeUpdate {
    date: Date
    time: string
}

function parseCalendarTimeMinutes(value: string) {
    if (!/^\d{4}$/.test(value)) return undefined

    const hours = Number(value.slice(0, 2))
    const minutes = Number(value.slice(2, 4))
    if (hours > 23 || minutes > 59) return undefined

    return hours * 60 + minutes
}

function parseTimeBound(value?: string) {
    if (!value) return undefined
    return parseCalendarTimeMinutes(value.replace(':', ''))
}

export function updateCalendarTime(
    date: Date | null,
    value: string,
    minTime?: string,
    maxTime?: string,
): CalendarTimeUpdate | undefined {
    const requestedMinutes = parseCalendarTimeMinutes(value)
    if (!date || requestedMinutes === undefined) return undefined

    let minutesOfDay = requestedMinutes
    const minimum = parseTimeBound(minTime)
    const maximum = parseTimeBound(maxTime)

    if (minimum !== undefined && minutesOfDay < minimum) {
        minutesOfDay = minimum
    }
    if (maximum !== undefined && minutesOfDay > maximum) {
        minutesOfDay = maximum
    }

    const hours = Math.floor(minutesOfDay / 60)
    const minutes = minutesOfDay % 60
    const result = new Date(date)
    result.setHours(hours, minutes, 0, 0)

    return {
        date: result,
        time: `${String(hours).padStart(2, '0')}${String(minutes).padStart(2, '0')}`,
    }
}
