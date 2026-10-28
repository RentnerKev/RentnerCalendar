import { expect, test } from '@playwright/test'

test('reanchors an open native select after a layout shift without scroll or resize events', async ({
    page,
}) => {
    await page.goto('/?native-select-fixture')
    const trigger = page.getByRole('combobox', { name: 'First native select' })
    await trigger.click()
    const popup = page.locator('[popover]:popover-open')
    await expect(popup).toBeVisible()
    await page.evaluate(
        () =>
            new Promise<void>((resolve) =>
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => resolve()),
                ),
            ),
    )
    const before = await trigger.boundingBox()
    await page.getByTestId('native-select-fixture').evaluate((element) => {
        element.style.paddingTop = '72px'
    })
    await expect
        .poll(async () => {
            const anchor = await trigger.boundingBox()
            const menu = await popup.boundingBox()
            if (!anchor || !menu || anchor.y < before!.y + 70) return 1000
            return Math.min(
                Math.abs(menu.y - anchor.y - anchor.height - 4),
                Math.abs(menu.y + menu.height - anchor.y + 4),
            )
        })
        .toBeLessThan(2)
    await page.keyboard.press('Escape')
    await expect(popup).toHaveCount(0)
    await expect(trigger).toBeFocused()
})
