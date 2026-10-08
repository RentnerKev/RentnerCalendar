const roundedMap: Record<string, string> = {
    'rounded-sm': '0.125rem',
    'rounded-md': '0.375rem',
    'rounded-lg': '0.5rem',
    'rounded-xl': '0.75rem',
    'rounded-2xl': '1rem',
    'rounded-3xl': '1.5rem',
    'rounded-full': '9999px',
    rounded: '0.25rem',
}

export function extractRadius(className: string): string | null {
    const keys = Object.keys(roundedMap).toSorted((a, b) => b.length - a.length)
    for (const key of keys) {
        if (className.includes(key)) {
            return roundedMap[key]
        }
    }
    return null
}

export function hasWidthUtilityClass(className: string) {
    return className.split(/\s+/).some((classToken) => {
        let squareBracketDepth = 0
        let roundBracketDepth = 0
        let lastVariantSeparator = -1

        for (let index = 0; index < classToken.length; index += 1) {
            const character = classToken[index]

            if (character === '\\') {
                index += 1
                continue
            }

            if (character === '[') squareBracketDepth += 1
            else if (character === ']') {
                squareBracketDepth = Math.max(0, squareBracketDepth - 1)
            } else if (character === '(') roundBracketDepth += 1
            else if (character === ')') {
                roundBracketDepth = Math.max(0, roundBracketDepth - 1)
            } else if (
                character === ':' &&
                squareBracketDepth === 0 &&
                roundBracketDepth === 0
            ) {
                lastVariantSeparator = index
            }
        }

        const utility = classToken.slice(lastVariantSeparator + 1)
        return utility.replace(/^!/, '').startsWith('w-')
    })
}
