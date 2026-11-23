const roundedEntries: ReadonlyArray<readonly [string, string]> = [
    ['rounded-full', '9999px'],
    ['rounded-2xl', '1rem'],
    ['rounded-3xl', '1.5rem'],
    ['rounded-sm', '0.125rem'],
    ['rounded-md', '0.375rem'],
    ['rounded-lg', '0.5rem'],
    ['rounded-xl', '0.75rem'],
    ['rounded', '0.25rem'],
]

export function extractRadius(className: string): string | null {
    if (!className || !className.includes('rounded')) return null
    for (let i = 0; i < roundedEntries.length; i += 1) {
        const entry = roundedEntries[i]!
        if (className.includes(entry[0])) {
            return entry[1]
        }
    }
    return null
}

function isWhitespace(code: number) {
    return (
        code === 32 || code === 9 || code === 10 || code === 13 || code === 12
    )
}

export function hasWidthUtilityClass(className: string) {
    if (!className || !className.includes('w-')) return false
    const len = className.length
    let i = 0
    while (i < len) {
        while (i < len && isWhitespace(className.charCodeAt(i))) i += 1
        if (i >= len) break
        const start = i
        let squareBracketDepth = 0
        let roundBracketDepth = 0
        let lastVariantSeparator = start - 1

        while (i < len && !isWhitespace(className.charCodeAt(i))) {
            const code = className.charCodeAt(i)
            if (code === 92) {
                i += 2
                continue
            }
            if (code === 91) squareBracketDepth += 1
            else if (code === 93) {
                if (squareBracketDepth > 0) squareBracketDepth -= 1
            } else if (code === 40) roundBracketDepth += 1
            else if (code === 41) {
                if (roundBracketDepth > 0) roundBracketDepth -= 1
            } else if (
                code === 58 &&
                squareBracketDepth === 0 &&
                roundBracketDepth === 0
            ) {
                lastVariantSeparator = i
            }
            i += 1
        }

        let uStart = lastVariantSeparator + 1
        if (uStart < i && className.charCodeAt(uStart) === 33) uStart += 1
        if (
            uStart + 1 < i &&
            className.charCodeAt(uStart) === 119 &&
            className.charCodeAt(uStart + 1) === 45
        ) {
            return true
        }
    }
    return false
}
