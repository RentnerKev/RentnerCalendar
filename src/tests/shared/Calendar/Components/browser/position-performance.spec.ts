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

for (const side of ['bottom', 'top'] as const) {
    test(`positions ${side} inside a scaled, bordered, scrolled portal ancestor`, async ({
        page,
    }) => {
        await page.goto('/calendar-contract.html')
        await expect(page.locator('#contract-single')).toBeVisible()
        await page.evaluate((placement) => {
            const portal = document.querySelector<HTMLElement>(
                '[data-testid="calendar-portals"]',
            )!
            const ancestor = document.createElement('div')
            ancestor.id = 'transformed-portals'
            Object.assign(ancestor.style, {
                position: 'absolute',
                top: '31px',
                left: '29px',
                width: '900px',
                height: '900px',
                transformOrigin: 'top left',
                transform: 'scale(0.8)',
                border: '7px solid transparent',
                overflow: 'auto',
                pointerEvents: 'none',
            })
            document.body.append(ancestor)
            ancestor.append(portal)
            portal.style.pointerEvents = 'auto'
            const spacer = document.createElement('div')
            Object.assign(spacer.style, { height: '1800px', width: '1800px' })
            ancestor.append(spacer)
            ancestor.scrollTop = 45
            ancestor.scrollLeft = 35
            const trigger =
                document.querySelector<HTMLElement>('#contract-single')!
            Object.assign(trigger.style, {
                position: 'fixed',
                top: placement === 'top' ? '650px' : '100px',
                left: '250px',
                width: '180px',
            })
        }, side)
        const trigger = page.locator('#contract-single')
        await trigger.click({ force: true })
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()
        const check = async () => {
            const anchor = (await trigger.boundingBox())!
            const popup = (await dialog.boundingBox())!
            expect(Math.abs(popup.x - anchor.x)).toBeLessThan(1)
            expect(
                Math.abs(
                    (side === 'bottom'
                        ? popup.y - anchor.y - anchor.height
                        : anchor.y - popup.y - popup.height) - 8,
                ),
            ).toBeLessThan(1)
            expect(Math.abs(popup.width - 340)).toBeLessThan(1)
        }
        await check()
        await page.locator('#transformed-portals').evaluate((ancestor) => {
            ancestor.scrollTop += 40
            ancestor.scrollLeft += 20
        })
        await expect
            .poll(async () => {
                const anchor = (await trigger.boundingBox())!
                const popup = (await dialog.boundingBox())!
                return Math.round(
                    side === 'bottom'
                        ? popup.y - anchor.y - anchor.height
                        : anchor.y - popup.y - popup.height,
                )
            })
            .toBe(8)
        await check()
    })
}

for (const mode of [
    'filter',
    'contain',
    'shadow-zoom',
    'zero-size-scale',
] as const) {
    test(`aligns RTL through a ${mode} portal containing block`, async ({
        page,
    }) => {
        await page.goto('/calendar-contract.html')
        await expect(page.locator('#contract-single')).toBeVisible()
        await page.evaluate((variant) => {
            const portal = document.querySelector<HTMLElement>(
                '[data-testid="calendar-portals"]',
            )!
            const ancestor = document.createElement('div')
            Object.assign(ancestor.style, {
                position: 'absolute',
                top: '39px',
                left: '27px',
                width: variant === 'zero-size-scale' ? '0px' : '900px',
                height: variant === 'zero-size-scale' ? '0px' : '700px',
                pointerEvents: 'none',
                ...(variant === 'filter'
                    ? { filter: 'blur(0px)' }
                    : variant === 'contain'
                      ? { contain: 'layout' }
                      : {
                            transform: 'scale(0.8)',
                            transformOrigin: 'top left',
                            zoom: '1.25',
                        }),
            })
            document.body.append(ancestor)
            if (variant === 'shadow-zoom') {
                const shadow = ancestor.attachShadow({ mode: 'open' })
                for (const style of document.querySelectorAll(
                    'style, link[rel="stylesheet"]',
                ))
                    shadow.append(style.cloneNode(true))
                shadow.append(portal)
            } else ancestor.append(portal)
            portal.style.pointerEvents = 'auto'
            const trigger =
                document.querySelector<HTMLElement>('#contract-single')!
            Object.assign(trigger.style, {
                position: 'fixed',
                top: '100px',
                left: '500px',
                width: '180px',
                direction: 'rtl',
            })
        }, mode)
        const trigger = page.locator('#contract-single')
        await trigger.click()
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()
        const anchor = (await trigger.boundingBox())!
        const popup = (await dialog.boundingBox())!
        expect(
            Math.abs(popup.x + popup.width - anchor.x - anchor.width),
        ).toBeLessThan(1)
        expect(Math.abs(popup.y - anchor.y - anchor.height - 8)).toBeLessThan(1)
        expect(Math.abs(popup.width - 340)).toBeLessThan(1)
    })
}

for (const layer of ['outer', 'inner'] as const) {
    test(`follows native scrolling in the ${layer} root of a nested shadow portal`, async ({
        page,
    }) => {
        await page.setViewportSize({ width: 1280, height: 1000 })
        await page.goto('/calendar-contract.html')
        await expect(page.locator('#contract-single')).toBeVisible()
        await page.evaluate(() => {
            const portal = document.querySelector<HTMLElement>(
                '[data-testid="calendar-portals"]',
            )!
            const host = document.createElement('div')
            document.body.append(host)
            const outerRoot = host.attachShadow({ mode: 'open' })
            for (const style of document.querySelectorAll(
                'style, link[rel="stylesheet"]',
            ))
                outerRoot.append(style.cloneNode(true))
            const outer = document.createElement('div')
            outer.id = 'calendar-outer-shadow-scroll'
            Object.assign(outer.style, {
                position: 'absolute',
                top: '30px',
                left: '25px',
                width: '1100px',
                height: '950px',
                overflow: 'auto',
                transform: 'scale(0.9)',
                transformOrigin: 'top left',
                pointerEvents: 'none',
            })
            outerRoot.append(outer)
            const innerHost = document.createElement('div')
            innerHost.style.height = '1600px'
            outer.append(innerHost)
            const innerRoot = innerHost.attachShadow({ mode: 'open' })
            for (const style of document.querySelectorAll(
                'style, link[rel="stylesheet"]',
            ))
                innerRoot.append(style.cloneNode(true))
            const inner = document.createElement('div')
            inner.id = 'calendar-inner-shadow-scroll'
            Object.assign(inner.style, {
                width: '1000px',
                height: '900px',
                overflow: 'auto',
                transform: 'scale(0.95)',
                transformOrigin: 'top left',
            })
            innerRoot.append(inner)
            inner.append(portal)
            portal.style.pointerEvents = 'auto'
            const spacer = document.createElement('div')
            Object.assign(spacer.style, { width: '1600px', height: '1600px' })
            inner.append(spacer)
            const trigger =
                document.querySelector<HTMLElement>('#contract-single')!
            Object.assign(trigger.style, {
                position: 'fixed',
                left: '400px',
                top: '120px',
                width: '180px',
            })
        })
        const trigger = page.locator('#contract-single')
        await trigger.click()
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible()
        const scroller = page.locator(`#calendar-${layer}-shadow-scroll`)
        await scroller.evaluate((element) => {
            element.addEventListener(
                'scroll',
                (event) => {
                    element.setAttribute(
                        'data-native-scroll',
                        String(event.isTrusted && !event.composed),
                    )
                },
                { once: true },
            )
            element.scrollTop = 50
            element.scrollLeft = 35
        })
        await expect(scroller).toHaveAttribute('data-native-scroll', 'true')
        await expect
            .poll(async () => {
                const anchor = (await trigger.boundingBox())!
                const popup = (await dialog.boundingBox())!
                return Math.max(
                    Math.abs(popup.x - anchor.x),
                    Math.abs(popup.y - anchor.y - anchor.height - 8),
                )
            })
            .toBeLessThan(1)
        await page.keyboard.press('Escape')
        await expect(dialog).toHaveCount(0)
        await expect(trigger).toBeFocused()
    })
}
