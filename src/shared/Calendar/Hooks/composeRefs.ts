import type { Ref, RefCallback } from 'react'

type MutableRef<T> = { current: T | null }

export function composeRefs<T>(
    ...refs: Array<Ref<T> | undefined>
): RefCallback<T> {
    const uniqueRefs = [
        ...new Set(
            refs.filter((ref): ref is NonNullable<Ref<T>> => ref != null),
        ),
    ]

    return (element) => {
        const cleanups: Array<() => void> = []
        const legacyCallbacks: Array<(value: T | null) => void> = []
        const objectRefs: MutableRef<T>[] = []

        for (const ref of uniqueRefs) {
            if (typeof ref === 'function') {
                const cleanup = ref(element)
                if (element === null) continue

                if (typeof cleanup === 'function') {
                    cleanups.push(cleanup)
                } else {
                    legacyCallbacks.push(ref)
                }
                continue
            }

            const mutableRef = ref as MutableRef<T>
            mutableRef.current = element
            if (element !== null) objectRefs.push(mutableRef)
        }

        if (element === null || cleanups.length === 0) return

        return () => {
            let cleanupError: unknown
            let cleanupFailed = false

            for (const cleanup of cleanups) {
                try {
                    cleanup()
                } catch (error) {
                    if (!cleanupFailed) cleanupError = error
                    cleanupFailed = true
                }
            }
            for (const ref of objectRefs) ref.current = null
            for (const ref of legacyCallbacks) {
                try {
                    ref(null)
                } catch (error) {
                    if (!cleanupFailed) cleanupError = error
                    cleanupFailed = true
                }
            }

            if (cleanupFailed) throw cleanupError
        }
    }
}
