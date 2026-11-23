export function resolveCalendarFieldError(
    externalError: string | null | undefined,
    internalError: string | null,
) {
    return externalError !== undefined ? externalError : internalError
}

export function mergeAriaIds(
    ...ids: Array<string | null | undefined>
): string | undefined {
    let out = ''
    for (let i = 0; i < ids.length; i += 1) {
        const value = ids[i]
        if (!value) continue
        if (!/\s/.test(value)) {
            if (!out) out = value
            else if (out !== value && !` ${out} `.includes(` ${value} `)) {
                out += ` ${value}`
            }
            continue
        }
        const parts = value.split(/\s+/)
        for (let j = 0; j < parts.length; j += 1) {
            const id = parts[j]
            if (id && out !== id && !` ${out} `.includes(` ${id} `)) {
                out = out ? `${out} ${id}` : id
            }
        }
    }
    return out || undefined
}
