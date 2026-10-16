import type { ContractPlaygroundLogicResult } from '../Types/ContractPlayground.types.ts'
import { useCallback, useState } from 'react'

export function useContractPlaygroundLogic(): ContractPlaygroundLogicResult {
    const [rangeDynamic, setRangeDynamic] = useState<
        [string | null, string | null] | undefined
    >(['2026-10-16T08:00:00.000Z', null])
    const [rangeMinimum, setRangeMinimum] = useState<Date | undefined>()
    function handleLaterRangeMinimum() {
        setRangeMinimum(new Date(2026, 9, 17, 9))
    }
    const [single, setSingle] = useState<string | undefined>(
        '2026-10-16T11:00:00.000Z',
    )
    const [range, setRange] = useState<
        [string | null, string | null] | undefined
    >(['2026-10-16', null])
    const [rangeInstant, setRangeInstant] = useState<
        [string | null, string | null] | undefined
    >(['2026-10-16T10:30:00.000Z', null])
    const [portalContainer, setPortalContainer] =
        useState<HTMLDivElement | null>(null)
    const [minimum, setMinimum] = useState(new Date(2026, 9, 16, 12, 30))
    const portalContainerRef = useCallback(
        (element: HTMLDivElement | null) => setPortalContainer(element),
        [],
    )
    function handleLaterMinimum() {
        setMinimum(new Date(2026, 9, 16, 13, 30))
    }
    return {
        state: {
            single,
            range,
            rangeInstant,
            rangeDynamic,
            rangeMinimum,
            portalContainer,
            minimum,
        },
        handler: { handleLaterMinimum, handleLaterRangeMinimum },
        setter: { setSingle, setRange, setRangeInstant, setRangeDynamic },
        refs: { portalContainerRef },
    }
}
