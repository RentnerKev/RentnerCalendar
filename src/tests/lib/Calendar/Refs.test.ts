import { describe, expect, mock, test } from 'bun:test'
import type { RefCallback } from 'react'
import { composeRefs } from '../../../shared/Calendar/Hooks/composeRefs.ts'

describe('composed React refs', () => {
    test('runs React 19 callback cleanup and clears object and legacy refs', () => {
        const element = {} as HTMLButtonElement
        const cleanupAwareRef = mock(() => mock(() => undefined))
        const legacyRef = mock(() => undefined)
        const internalRef: { current: HTMLButtonElement | null } = {
            current: null,
        }
        const composedRef = composeRefs(
            internalRef,
            cleanupAwareRef as RefCallback<HTMLButtonElement>,
            legacyRef as RefCallback<HTMLButtonElement>,
        )

        const cleanup = composedRef(element)
        expect(internalRef.current).toBe(element)
        expect(cleanupAwareRef).toHaveBeenCalledTimes(1)
        expect(legacyRef).toHaveBeenCalledWith(element)
        expect(typeof cleanup).toBe('function')

        cleanup?.()

        expect(internalRef.current).toBeNull()
        expect(cleanupAwareRef).toHaveBeenCalledTimes(1)
        expect(cleanupAwareRef.mock.results[0]?.value).toHaveBeenCalledTimes(1)
        expect(legacyRef).toHaveBeenLastCalledWith(null)
    })

    test('assigns each duplicate ref once and supports legacy null teardown', () => {
        const element = {} as HTMLButtonElement
        const callbackRef = mock(() => undefined)
        const objectRef: { current: HTMLButtonElement | null } = {
            current: null,
        }
        const composedRef = composeRefs(
            callbackRef as RefCallback<HTMLButtonElement>,
            callbackRef as RefCallback<HTMLButtonElement>,
            objectRef,
            objectRef,
        )

        const cleanup = composedRef(element)
        expect(cleanup).toBeUndefined()
        expect(callbackRef).toHaveBeenCalledTimes(1)
        expect(objectRef.current).toBe(element)

        composedRef(null)

        expect(callbackRef).toHaveBeenCalledTimes(2)
        expect(callbackRef).toHaveBeenLastCalledWith(null)
        expect(objectRef.current).toBeNull()
    })
})
