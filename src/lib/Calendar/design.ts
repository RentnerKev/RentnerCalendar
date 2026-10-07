import type { CSSProperties } from 'react'

export function getTooltipStyle(
    index: number,
    visibleDays: number,
): CSSProperties {
    const col = index % visibleDays
    if (col <= 1) {
        return { left: '0', transform: 'none' }
    } else if (col >= visibleDays - 2) {
        return { right: '0', left: 'auto', transform: 'none' }
    }
    return { left: '50%', transform: 'translateX(-50%)' }
}

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
