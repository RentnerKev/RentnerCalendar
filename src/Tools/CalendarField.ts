export function resolveCalendarFieldError(
    externalError: string | null | undefined,
    internalError: string | null,
) {
    return externalError !== undefined ? externalError : internalError
}

export function mergeAriaIds(
    ...ids: Array<string | null | undefined>
): string | undefined {
    const mergedIds = ids
        .flatMap((value) => value?.split(/\s+/) ?? [])
        .filter(Boolean)

    return mergedIds.length > 0 ? [...new Set(mergedIds)].join(' ') : undefined
}
