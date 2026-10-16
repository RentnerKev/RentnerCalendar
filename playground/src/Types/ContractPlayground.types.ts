import type { Dispatch, RefCallback, SetStateAction } from 'react'

export interface ContractPlaygroundLogicResult {
    state: {
        single: string | undefined
        range: [string | null, string | null] | undefined
        rangeDynamic: [string | null, string | null] | undefined
        rangeMinimum: Date | undefined
        rangeInstant: [string | null, string | null] | undefined
        portalContainer: HTMLDivElement | null
        minimum: Date
    }
    handler: {
        handleLaterMinimum: () => void
        handleLaterRangeMinimum: () => void
    }
    setter: {
        setSingle: Dispatch<SetStateAction<string | undefined>>
        setRange: Dispatch<
            SetStateAction<[string | null, string | null] | undefined>
        >
        setRangeDynamic: Dispatch<
            SetStateAction<[string | null, string | null] | undefined>
        >
        setRangeInstant: Dispatch<
            SetStateAction<[string | null, string | null] | undefined>
        >
    }
    refs: { portalContainerRef: RefCallback<HTMLDivElement> }
}
