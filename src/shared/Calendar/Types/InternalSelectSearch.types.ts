import type { Option } from './InternalSelect.types.ts'

export interface InternalSelectSearchRow {
    option: Option
    label: string
    value: string
    subOption: string | undefined
    normalizedLabel: string
    normalizedValue: string
    normalizedSubOption: string
}

export interface InternalSelectSearchModel {
    rows: InternalSelectSearchRow[]
}
