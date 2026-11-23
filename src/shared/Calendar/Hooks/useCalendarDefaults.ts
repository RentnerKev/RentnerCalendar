import { createContext, useContext, useMemo, useState } from 'react'
import type {
    CalendarDefaults,
    CalendarProviderProps,
    CalendarProviderLogicResult,
} from '../Types/CalendarProvider.types.ts'
import type { CalendarMessages } from '../../../lib/Calendar/Types/Messages.types.ts'

const EMPTY_DEFAULTS: CalendarDefaults = {}

export const CalendarContext =
    /* @__PURE__ */ createContext<CalendarDefaults>(EMPTY_DEFAULTS)

export function useCalendarDefaults(): CalendarDefaults {
    return useContext(CalendarContext)
}

function shallowEqualRecord(a: object, b: object): boolean {
    const keysA = Object.keys(a)
    if (keysA.length !== Object.keys(b).length) return false
    const recA = a as Record<string, unknown>
    const recB = b as Record<string, unknown>
    for (let i = 0; i < keysA.length; i += 1) {
        const key = keysA[i]!
        if (!Object.is(recA[key], recB[key])) return false
    }
    return true
}

function messagesEqual(
    a: Partial<CalendarMessages>,
    b: Partial<CalendarMessages>,
): boolean {
    const keysA = Object.keys(a)
    if (keysA.length !== Object.keys(b).length) return false
    const recA = a as Record<string, unknown>
    const recB = b as Record<string, unknown>
    for (let i = 0; i < keysA.length; i += 1) {
        const key = keysA[i]!
        const valA = recA[key]
        const valB = recB[key]
        if (Object.is(valA, valB)) continue
        if (
            key === 'holidayNames' &&
            valA &&
            valB &&
            typeof valA === 'object' &&
            typeof valB === 'object' &&
            shallowEqualRecord(valA, valB)
        ) {
            continue
        }
        return false
    }
    return true
}

function useStableOptionalRecord<T extends object>(
    value: T | undefined,
    isEqual: (a: T, b: T) => boolean = shallowEqualRecord,
): T | undefined {
    const [stable, setStable] = useState(value)
    if (stable === value) return stable
    if (stable && value && isEqual(stable, value)) return stable
    setStable(value)
    return value
}

export function useCalendarProviderLogic({
    controlSize,
    classNames,
    portalContainer,
    portalClassName,
    portalZIndex,
    popoverMaxWidth,
    locale,
    messages,
    customDesign,
}: CalendarProviderProps): CalendarProviderLogicResult {
    const parent = useCalendarDefaults()
    const stableClassNames = useStableOptionalRecord(classNames)
    const stableMessages = useStableOptionalRecord(messages, messagesEqual)
    const stableCustomDesign = useStableOptionalRecord(customDesign)

    const mergedClassNames = useMemo(
        () =>
            !parent.classNames && !stableClassNames
                ? undefined
                : !stableClassNames
                  ? parent.classNames
                  : !parent.classNames
                    ? { ...stableClassNames }
                    : { ...parent.classNames, ...stableClassNames },
        [parent.classNames, stableClassNames],
    )
    const mergedCustomDesign = useMemo(
        () =>
            !parent.customDesign && !stableCustomDesign
                ? undefined
                : !stableCustomDesign
                  ? parent.customDesign
                  : !parent.customDesign
                    ? { ...stableCustomDesign }
                    : { ...parent.customDesign, ...stableCustomDesign },
        [parent.customDesign, stableCustomDesign],
    )
    const mergedMessages = useMemo(() => {
        if (!parent.messages && !stableMessages) return undefined
        if (!stableMessages) return parent.messages
        const mergedHolidayNames =
            parent.messages?.holidayNames || stableMessages.holidayNames
                ? {
                      ...parent.messages?.holidayNames,
                      ...stableMessages.holidayNames,
                  }
                : undefined
        return mergedHolidayNames
            ? {
                  ...parent.messages,
                  ...stableMessages,
                  holidayNames: mergedHolidayNames,
              }
            : {
                  ...parent.messages,
                  ...stableMessages,
              }
    }, [parent.messages, stableMessages])

    const nextControlSize = controlSize ?? parent.controlSize
    const nextPortalContainer =
        portalContainer === undefined ? parent.portalContainer : portalContainer
    const nextPortalClassName = portalClassName ?? parent.portalClassName
    const nextPortalZIndex = portalZIndex ?? parent.portalZIndex
    const nextPopoverMaxWidth =
        popoverMaxWidth !== undefined && popoverMaxWidth > 0
            ? popoverMaxWidth
            : parent.popoverMaxWidth
    const nextLocale = locale ?? parent.locale

    const value = useMemo<CalendarDefaults>(
        () => ({
            controlSize: nextControlSize,
            classNames: mergedClassNames,
            portalContainer: nextPortalContainer,
            portalClassName: nextPortalClassName,
            portalZIndex: nextPortalZIndex,
            popoverMaxWidth: nextPopoverMaxWidth,
            locale: nextLocale,
            messages: mergedMessages,
            customDesign: mergedCustomDesign,
        }),
        [
            nextControlSize,
            mergedClassNames,
            nextPortalContainer,
            nextPortalClassName,
            nextPortalZIndex,
            nextPopoverMaxWidth,
            nextLocale,
            mergedMessages,
            mergedCustomDesign,
        ],
    )
    return { state: { value } }
}
