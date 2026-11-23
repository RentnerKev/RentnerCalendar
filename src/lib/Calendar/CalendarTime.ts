export interface CalendarTimeUpdate {
    date: Date
    time: string
}

function parseCalendarTimeMinutes(value: string) {
    if (value.length !== 4) return undefined
    const d0 = value.charCodeAt(0) - 48
    const d1 = value.charCodeAt(1) - 48
    const d2 = value.charCodeAt(2) - 48
    const d3 = value.charCodeAt(3) - 48
    if (
        d0 < 0 ||
        d0 > 9 ||
        d1 < 0 ||
        d1 > 9 ||
        d2 < 0 ||
        d2 > 9 ||
        d3 < 0 ||
        d3 > 9
    ) {
        return undefined
    }
    const hours = d0 * 10 + d1
    const minutes = d2 * 10 + d3
    if (hours > 23 || minutes > 59) return undefined

    return hours * 60 + minutes
}

function parseTimeBound(value?: string) {
    if (!value) return undefined
    if (value.length === 5 && value.charCodeAt(2) === 58) {
        const d0 = value.charCodeAt(0) - 48
        const d1 = value.charCodeAt(1) - 48
        const d2 = value.charCodeAt(3) - 48
        const d3 = value.charCodeAt(4) - 48
        if (
            d0 < 0 ||
            d0 > 9 ||
            d1 < 0 ||
            d1 > 9 ||
            d2 < 0 ||
            d2 > 9 ||
            d3 < 0 ||
            d3 > 9
        ) {
            return undefined
        }
        const hours = d0 * 10 + d1
        const minutes = d2 * 10 + d3
        return hours <= 23 && minutes <= 59 ? hours * 60 + minutes : undefined
    }
    return parseCalendarTimeMinutes(value)
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
    const h = date.getHours()
    const m = date.getMinutes()
    return `${h < 10 ? '0' : ''}${h}${m < 10 ? '0' : ''}${m}`
}

function matchesCalendarMinute(
    probe: Date,
    year: number,
    month: number,
    day: number,
    minutesOfDay: number,
) {
    probe.setFullYear(year, month, day)
    probe.setHours((minutesOfDay / 60) | 0, minutesOfDay % 60, 0, 0)
    return (
        !Number.isNaN(probe.getTime()) &&
        probe.getFullYear() === year &&
        probe.getMonth() === month &&
        probe.getDate() === day &&
        probe.getHours() * 60 + probe.getMinutes() === minutesOfDay
    )
}

function createCalendarDateAtMinute(date: Date, minutesOfDay: number) {
    const result = new Date(date.getTime())
    result.setHours((minutesOfDay / 60) | 0, minutesOfDay % 60, 0, 0)

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

    const year = date.getFullYear()
    const month = date.getMonth()
    const day = date.getDate()
    const probe = new Date(date.getTime())

    for (
        let minutes = bounds.firstAllowedMinute;
        minutes <= bounds.lastAllowedMinute;
        minutes += 1
    ) {
        if (matchesCalendarMinute(probe, year, month, day, minutes)) return true
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
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) return false
        const minutes = value.getHours() * 60 + value.getMinutes()
        return minutes >= firstAllowedMinute && minutes <= lastAllowedMinute
    }

    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i += 1) {
            const date = value[i]
            if (date === null) continue
            if (Number.isNaN(date.getTime())) return false
            const minutes = date.getHours() * 60 + date.getMinutes()
            if (minutes < firstAllowedMinute || minutes > lastAllowedMinute) {
                return false
            }
        }
        return true
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

    if (Number.isNaN(date.getTime())) return undefined
    const bounds = getTimeBounds(minTime, maxTime)
    if (!bounds) return undefined

    const minutes = date.getHours() * 60 + date.getMinutes()
    if (
        minutes >= bounds.firstAllowedMinute &&
        minutes <= bounds.lastAllowedMinute
    ) {
        return date
    }

    const requestedTime = formatCalendarTime(date)
    const update = updateCalendarTime(date, requestedTime, minTime, maxTime)
    if (!update) return undefined

    return update.time === requestedTime ? date : update.date
}
