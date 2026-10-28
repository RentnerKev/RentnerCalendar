import type { Option } from '../../shared/Calendar/Types/InternalSelect.types.ts'
import type {
    InternalSelectSearchModel,
    InternalSelectSearchRow,
} from '../../shared/Calendar/Types/InternalSelectSearch.types.ts'

export function reconcileCalendarSelectSearch(
    previous: InternalSelectSearchModel | undefined,
    options: Option[],
): InternalSelectSearchModel {
    if (previous && previous.rows.length === options.length) {
        let same = true
        for (let index = 0; index < options.length; index++) {
            if (index in options !== index in previous.rows) {
                same = false
                break
            }
            if (!(index in options)) continue
            const prior = previous.rows[index]!
            const option = options[index]!
            if (
                prior.option !== option ||
                prior.label !== option.label ||
                prior.value !== option.value ||
                prior.subOption !== option.subOption
            ) {
                same = false
                break
            }
        }
        if (same) return previous
    }
    const rows = options.map((option, index): InternalSelectSearchRow => {
        const prior = previous?.rows[index]
        const { label, value, subOption } = option
        if (
            prior &&
            prior.option === option &&
            prior.label === label &&
            prior.value === value &&
            prior.subOption === subOption
        )
            return prior
        return {
            option,
            label,
            value,
            subOption,
            normalizedLabel:
                prior?.label === label
                    ? prior.normalizedLabel
                    : label.toLowerCase(),
            normalizedValue:
                prior?.value === value
                    ? prior.normalizedValue
                    : value.toLowerCase(),
            normalizedSubOption:
                prior && prior.subOption === subOption
                    ? prior.normalizedSubOption
                    : (subOption?.toLowerCase() ?? ''),
        }
    })
    return { rows }
}

export function filterCalendarSelectSearch(
    model: InternalSelectSearchModel,
    normalizedSearch: string,
): Option[] {
    return model.rows
        .filter(
            ({ normalizedLabel, normalizedValue, normalizedSubOption }) =>
                normalizedLabel.includes(normalizedSearch) ||
                normalizedValue.includes(normalizedSearch) ||
                normalizedSubOption.includes(normalizedSearch),
        )
        .map(({ option }) => option)
}
