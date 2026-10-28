import { describe, expect, test } from 'bun:test'
import {
    filterCalendarSelectSearch,
    reconcileCalendarSelectSearch,
} from '../../../lib/Calendar/CalendarSelectSearch.ts'
import type { Option } from '../../../shared/Calendar/Types/InternalSelect.types.ts'

function originalFilter(options: Option[], query: string) {
    return options.filter(
        (option) =>
            option.label.toLowerCase().includes(query) ||
            option.value.toLowerCase().includes(query) ||
            (option.subOption?.toLowerCase() ?? '').includes(query),
    )
}

describe('calendar select normalized search model', () => {
    test('preserves literal includes, Unicode casing and independent field boundaries', () => {
        const options = [
            { label: 'Äpfel und ÖL', value: 'fruit', subOption: '日本語' },
            { label: 'İSTANBUL', value: 'city', subOption: 'ΣΟΣ' },
            { label: 'a.*[b]', value: 'literal', subOption: 'a+b?' },
            { label: 'AB', value: 'CD', subOption: 'EF' },
            { label: 'Café', value: 'accent' },
        ]
        const model = reconcileCalendarSelectSearch(undefined, options)
        for (const query of [
            'äpf',
            'öl',
            '日本',
            'i̇s',
            'σος',
            '.*[',
            '+b?',
            'bc',
            'de',
            'cafe',
            'café',
            '',
            'missing',
        ]) {
            expect(filterCalendarSelectSearch(model, query)).toEqual(
                originalFilter(options, query),
            )
        }
        expect(filterCalendarSelectSearch(model, 'bc')).toEqual([])
        expect(filterCalendarSelectSearch(model, 'de')).toEqual([])
        expect(filterCalendarSelectSearch(model, 'cafe')).toEqual([])
    })

    test('retains the model and row identities for unchanged values and new array containers', () => {
        const options = [
            { label: 'Alpha', value: 'a' },
            { label: 'Beta', value: 'b', subOption: 'Group' },
        ]
        const first = reconcileCalendarSelectSearch(undefined, options)
        expect(reconcileCalendarSelectSearch(first, options)).toBe(first)
        expect(reconcileCalendarSelectSearch(first, [...options])).toBe(first)
        const replaced = [{ ...options[0] }, options[1]]
        const second = reconcileCalendarSelectSearch(first, replaced)
        expect(second).not.toBe(first)
        expect(second.rows[0].option).toBe(replaced[0])
        expect(second.rows[1]).toBe(first.rows[1])
        expect(filterCalendarSelectSearch(second, 'alpha')[0]).toBe(replaced[0])
    })

    test('detects same-reference label/value/subOption edits and removals without stale matches', () => {
        const options: Option[] = [
            { label: 'Alpha', value: 'a', subOption: 'First group' },
            { label: 'Beta', value: 'b' },
        ]
        let model = reconcileCalendarSelectSearch(undefined, options)
        const untouched = model.rows[1]
        options[0].label = 'Changed label'
        options[0].value = 'changed-value'
        options[0].subOption = 'Changed group'
        model = reconcileCalendarSelectSearch(model, options)
        expect(model.rows[1]).toBe(untouched)
        expect(filterCalendarSelectSearch(model, 'alpha')).toEqual([])
        for (const query of ['changed label', 'changed-value', 'changed group'])
            expect(filterCalendarSelectSearch(model, query)).toEqual([
                options[0],
            ])
        delete options[0].subOption
        model = reconcileCalendarSelectSearch(model, options)
        expect(filterCalendarSelectSearch(model, 'changed group')).toEqual([])
        options.pop()
        model = reconcileCalendarSelectSearch(model, options)
        expect(filterCalendarSelectSearch(model, 'beta')).toEqual([])
    })

    test('returns current option references in the current order after reorder, insertion and replacement', () => {
        const options = [
            { label: 'Shared Alpha', value: 'a' },
            { label: 'Shared Beta', value: 'b' },
        ]
        let model = reconcileCalendarSelectSearch(undefined, options)
        options.reverse()
        model = reconcileCalendarSelectSearch(model, options)
        expect(filterCalendarSelectSearch(model, 'shared')).toEqual(options)
        const inserted = { label: 'Shared Gamma', value: 'g' }
        options.splice(1, 0, inserted)
        model = reconcileCalendarSelectSearch(model, options)
        expect(filterCalendarSelectSearch(model, 'shared')[1]).toBe(inserted)
        const replacement = [{ label: 'Only replacement', value: 'new' }]
        model = reconcileCalendarSelectSearch(model, replacement)
        expect(filterCalendarSelectSearch(model, 'shared')).toEqual([])
        expect(filterCalendarSelectSearch(model, 'replacement')[0]).toBe(
            replacement[0],
        )
    })

    test('preserves sparse-array holes when reconciling and skips them during filtering', () => {
        const options: Option[] = []
        options.length = 4
        options[1] = { label: 'Alpha', value: 'a' }
        options[3] = { label: 'Beta', value: 'b' }
        const first = reconcileCalendarSelectSearch(undefined, options)
        expect(0 in first.rows).toBe(false)
        expect(2 in first.rows).toBe(false)
        expect(reconcileCalendarSelectSearch(first, options)).toBe(first)
        expect(filterCalendarSelectSearch(first, '')).toEqual([
            options[1],
            options[3],
        ])
        delete options[1]
        options[0] = { label: 'Gamma', value: 'g' }
        const next = reconcileCalendarSelectSearch(first, options)
        expect(next).not.toBe(first)
        expect(1 in next.rows).toBe(false)
        expect(filterCalendarSelectSearch(next, '')).toEqual([
            options[0],
            options[3],
        ])
    })
})
