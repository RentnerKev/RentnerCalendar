import { expect, test } from '@playwright/test'

test('repositions a shadow-root calendar when a light-DOM ancestor scrolls', async ({
    page,
}) => {
    await page.goto('/calendar-shadow.html')
    const formatsMatch = await page.locator('#shadow-host').evaluate((host) => {
        const date = new Date(2026, 9, 7, 13, 30)
        return ['de', 'en'].every((locale) => {
            const intlLocale = locale === 'en' ? 'en-US' : 'de-DE'
            const expected = `${date.toLocaleDateString(intlLocale, { day: '2-digit', month: '2-digit', year: 'numeric' })} ${date.toLocaleTimeString(intlLocale, { hour: '2-digit', minute: '2-digit' })}`
            return host.getAttribute(`data-${locale}`) === expected
        })
    })
    expect(formatsMatch).toBe(true)
    const trigger = page.locator('#shadow-calendar')
    await trigger.click()
    const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
    await expect(dialog).toBeVisible()
    const before = (await dialog.boundingBox())!.y
    await page.locator('#scroll-ancestor').evaluate((element) => {
        element.scrollTop = 80
    })
    await expect
        .poll(async () => (await dialog.boundingBox())!.y)
        .toBe(before - 80)
})

test('ignores independent/popup scrolling but follows ancestor, viewport and resize', async ({
    page,
}) => {
    await page.goto('/')
    await page.locator('#appointment').click()
    const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
    await expect(dialog).toBeVisible()
    const counts = await page.evaluate(() => {
        const anchor = document.querySelector<HTMLElement>('#appointment')!
        const popup = document.querySelector<HTMLElement>('[role="dialog"]')!
        const independent = document.createElement('div')
        document.body.append(independent)
        const original = anchor.getBoundingClientRect.bind(anchor)
        let reads = 0
        anchor.getBoundingClientRect = () => {
            reads++
            return original()
        }
        for (let index = 0; index < 10; index++)
            independent.dispatchEvent(new Event('scroll'))
        const unrelated = reads
        for (let index = 0; index < 10; index++)
            popup.dispatchEvent(new Event('scroll'))
        const popupReads = reads - unrelated
        anchor.parentElement!.dispatchEvent(new Event('scroll'))
        const ancestor = reads - unrelated - popupReads
        window.dispatchEvent(new Event('scroll'))
        document.dispatchEvent(new Event('scroll'))
        const viewport = reads - unrelated - popupReads - ancestor
        independent.remove()
        return { unrelated, popupReads, ancestor, viewport }
    })
    expect(counts).toEqual({
        unrelated: 0,
        popupReads: 0,
        ancestor: 1,
        viewport: 2,
    })
    const unchangedRenderFormats = await page.evaluate(async () => {
        // Settle the preceding same-position events before tracking render work.
        await new Promise((done) => setTimeout(done, 25))
        const original = Intl.DateTimeFormat
        let constructions = 0
        Intl.DateTimeFormat = new Proxy(original, {
            construct(target, args) {
                constructions++
                return Reflect.construct(target, args)
            },
        })
        try {
            for (let index = 0; index < 10; index++) {
                window.dispatchEvent(new Event('scroll'))
                // eslint-disable-next-line no-await-in-loop -- Separate scroll tasks verify state bailouts, without React event batching.
                await new Promise((done) => setTimeout(done, 0))
            }
            return constructions
        } finally {
            Intl.DateTimeFormat = original
        }
    })
    expect(unchangedRenderFormats).toBe(0)
    await page.setViewportSize({ width: 420, height: 420 })
    await expect
        .poll(async () =>
            dialog.evaluate(
                (element) =>
                    element.getBoundingClientRect().right <= innerWidth,
            ),
        )
        .toBe(true)
})
