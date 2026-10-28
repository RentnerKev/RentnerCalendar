import { useMemo, useState } from 'react'
import type { Option } from '../Types/InternalSelect.types.ts'
import type { InternalSelectSearchModel } from '../Types/InternalSelectSearch.types.ts'
import {
    filterCalendarSelectSearch,
    reconcileCalendarSelectSearch,
} from '../../../lib/Calendar/CalendarSelectSearch.ts'

export function useInternalSelectSearch(
    options: Option[],
    searchValue: string,
) {
    const [cached, setCached] = useState<InternalSelectSearchModel>()
    const search = searchValue.trim().toLowerCase()
    const model = search
        ? reconcileCalendarSelectSearch(cached, options)
        : undefined
    if (model !== cached) setCached(model)
    const filteredOptions = useMemo(
        () => (model ? filterCalendarSelectSearch(model, search) : options),
        [model, search, options],
    )
    return { state: { filteredOptions } }
}
