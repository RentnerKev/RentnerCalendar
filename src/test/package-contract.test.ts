import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'
import { getGermanHolidayName, isSameDay, isToday } from '../index.js'

interface PackageContract {
    exports: Record<string, unknown>
    peerDependencies: Record<string, string>
    scripts: Record<string, string>
}

const packageJson = JSON.parse(
    readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
) as PackageContract
const readme = readFileSync(new URL('../../README.md', import.meta.url), 'utf8')

describe('published package contract', () => {
    test('keeps the shared React and test contracts', () => {
        expect(packageJson.peerDependencies.react).toBe('^19.0.0')
        expect(packageJson.peerDependencies['react-dom']).toBe('^19.0.0')
        expect(packageJson.scripts.test).toBe('bun test')
    })

    test('publishes documented subpaths', () => {
        expect(Object.keys(packageJson.exports)).toContainAllValues([
            '.',
            './tailwind.css',
            './calendar',
            './single-calendar',
            './range-calendar',
            './value',
            './format',
            './date',
            './messages',
            './types',
            './package.json',
        ])
    })

    test('documents npm before Bun installation', () => {
        const npmInstallPosition = readme.indexOf(
            'npm install @rentnerkev/calendar',
        )
        const bunInstallPosition = readme.indexOf(
            'bun add @rentnerkev/calendar',
        )

        expect(npmInstallPosition).toBeGreaterThan(-1)
        expect(bunInstallPosition).toBeGreaterThan(npmInstallPosition)
    })

    test('exports the documented date helpers', () => {
        const firstDate = new Date(2026, 8, 22, 8)
        const secondDate = new Date(2026, 8, 22, 18)

        expect(isSameDay(firstDate, secondDate)).toBe(true)
        expect(isToday(new Date())).toBe(true)
        expect(getGermanHolidayName(new Date(2026, 0, 1))).toBe('Neujahr')
    })
})
