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

function getTimeBounds(minTime?: string, maxTime?: string) {
    const minimum = parseTimeBound(minTime)
    const maximum = parseTimeBound(maxTime)

    if (minimum !== undefined && maximum !== undefined && minimum > maximum) {
        return undefined
    }

    return {
        minimum,
        maximum,
        firstAllowedMinute: minimum ?? 0,
        lastAllowedMinute: maximum ?? 23 * 60 + 59,
    }
}

function formatCalendarTime(date: Date) {
    return `${String(date.getHours()).padStart(2, '0')}${String(date.getMinutes()).padStart(2, '0')}`
}

function createCalendarDateAtMinute(date: Date, minutesOfDay: number) {
    const result = new Date(date)
    result.setHours(Math.floor(minutesOfDay / 60), minutesOfDay % 60, 0, 0)

    if (
        Number.isNaN(result.getTime()) ||
        result.getFullYear() !== date.getFullYear() ||
        result.getMonth() !== date.getMonth() ||
        result.getDate() !== date.getDate() ||
        result.getHours() * 60 + result.getMinutes() !== minutesOfDay
    ) {
        return undefined
    }

    return result
}

export function hasCalendarTimeWithinBounds(
    date: Date,
    minTime?: string,
    maxTime?: string,
) {
    if (Number.isNaN(date.getTime())) return false
    if (!minTime && !maxTime) return true

    const bounds = getTimeBounds(minTime, maxTime)
    if (!bounds) return false

    for (
        let minutes = bounds.firstAllowedMinute;
        minutes <= bounds.lastAllowedMinute;
        minutes += 1
    ) {
        if (createCalendarDateAtMinute(date, minutes)) return true
    }

    return false
}

export function calendarValueHasTimeWithinBounds(
    value: Date | readonly (Date | null)[] | undefined,
    minTime?: string,
    maxTime?: string,
) {
    const bounds = getTimeBounds(minTime, maxTime)
    if (!bounds) return false

    const { firstAllowedMinute, lastAllowedMinute } = bounds
    function selectedTimeIsAllowed(date: Date) {
        if (Number.isNaN(date.getTime())) return false
        const minutes = date.getHours() * 60 + date.getMinutes()
        return minutes >= firstAllowedMinute && minutes <= lastAllowedMinute
    }

    if (value instanceof Date) {
        return selectedTimeIsAllowed(value)
    }

    if (Array.isArray(value)) {
        return value.every(
            (date) => date === null || selectedTimeIsAllowed(date),
        )
    }

    return true
}

export function updateCalendarTime(
    date: Date | null,
    value: string,
    minTime?: string,
    maxTime?: string,
): CalendarTimeUpdate | undefined {
    const requestedMinutes = parseCalendarTimeMinutes(value)
    if (
        !date ||
        Number.isNaN(date.getTime()) ||
        requestedMinutes === undefined
    ) {
        return undefined
    }

    const bounds = getTimeBounds(minTime, maxTime)
    if (!bounds) return undefined

    let minutesOfDay = requestedMinutes
    let clampDirection: -1 | 0 | 1 = 0

    if (bounds.minimum !== undefined && minutesOfDay < bounds.minimum) {
        minutesOfDay = bounds.minimum
        clampDirection = 1
    } else if (bounds.maximum !== undefined && minutesOfDay > bounds.maximum) {
        minutesOfDay = bounds.maximum
        clampDirection = -1
    }

    let result = createCalendarDateAtMinute(date, minutesOfDay)

    if (!result && clampDirection !== 0) {
        for (
            let candidate = minutesOfDay + clampDirection;
            candidate >= bounds.firstAllowedMinute &&
            candidate <= bounds.lastAllowedMinute;
            candidate += clampDirection
        ) {
            result = createCalendarDateAtMinute(date, candidate)
            if (result) break
        }
    }

    if (!result) return undefined

    return {
        date: result,
        time: formatCalendarTime(result),
    }
}

export function resolveCalendarSelectionTime(
    date: Date,
    value: string,
    minTime?: string,
    maxTime?: string,
): CalendarTimeUpdate | undefined {
    const update = updateCalendarTime(date, value, minTime, maxTime)
    if (update) return update

    const requestedMinutes = parseCalendarTimeMinutes(value)
    const bounds = getTimeBounds(minTime, maxTime)
    if (
        !date ||
        Number.isNaN(date.getTime()) ||
        requestedMinutes === undefined ||
        !bounds
    ) {
        return undefined
    }

    for (let distance = 1; distance < 24 * 60; distance += 1) {
        const earlier = requestedMinutes - distance
        if (
            earlier >= bounds.firstAllowedMinute &&
            earlier <= bounds.lastAllowedMinute
        ) {
            const result = createCalendarDateAtMinute(date, earlier)
            if (result) {
                return { date: result, time: formatCalendarTime(result) }
            }
        }

        const later = requestedMinutes + distance
        if (
            later >= bounds.firstAllowedMinute &&
            later <= bounds.lastAllowedMinute
        ) {
            const result = createCalendarDateAtMinute(date, later)
            if (result) {
                return { date: result, time: formatCalendarTime(result) }
            }
        }
    }

    return undefined
}

export function constrainCalendarTime(
    date: Date,
    minTime?: string,
    maxTime?: string,
): Date | undefined {
    if (!minTime && !maxTime) return date

    const requestedTime = formatCalendarTime(date)
    const update = updateCalendarTime(date, requestedTime, minTime, maxTime)
    if (!update) return undefined

    return update.time === requestedTime ? date : update.date
}
