import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
    await page.goto('/?native-select-fixture')
    await expect(page.getByTestId('native-select-fixture')).toBeVisible()
})

test('advances through options inside an open shadow root', async ({
    page,
}) => {
    await page.getByRole('combobox', { name: 'Shadow native select' }).click()
    const search = page.getByRole('textbox', { name: 'Optionen suchen' })
    await expect(search).toBeFocused()
    await search.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Alpha' })).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'Beta' })).toBeFocused()
    await page.keyboard.press('ArrowUp')
    await expect(page.getByRole('option', { name: 'Alpha' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(
        page.getByRole('combobox', { name: 'Shadow native select' }),
    ).toBeFocused()
})

test('reopens the native top layer and retains search focus after changing portal containers', async ({
    page,
}) => {
    const trigger = page.getByRole('combobox', { name: 'Moving native select' })
    await trigger.click()
    const firstTarget = page.getByTestId('first-native-target')
    const secondTarget = page.getByTestId('second-native-target')
    await expect(firstTarget.locator('[popover]')).toHaveJSProperty(
        'popover',
        'manual',
    )
    await expect(
        page.getByRole('textbox', { name: 'Optionen suchen' }),
    ).toBeFocused()
    // A programmatic configuration update must preserve the open widget; a real
    // pointer click would intentionally dismiss it through outside-pointer handling.
    await page
        .getByRole('button', { name: 'Move open portal' })
        .dispatchEvent('click')
    await expect(firstTarget.locator('[popover]')).toHaveCount(0)
    await expect(secondTarget.locator('[popover]')).toBeVisible()
    await expect
        .poll(() =>
            secondTarget
                .locator('[popover]')
                .evaluate((node) => node.matches(':popover-open')),
        )
        .toBe(true)
    await expect(
        secondTarget.getByRole('textbox', { name: 'Optionen suchen' }),
    ).toBeFocused()
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
    await expect(secondTarget.locator('[popover]')).toHaveCount(0)
})

test('closes the previous select when keyboard focus opens another and restores the latest trigger on Escape', async ({
    page,
}) => {
    const first = page.getByRole('combobox', { name: 'First native select' })
    const second = page.getByRole('combobox', { name: 'Second native select' })
    await first.click()
    await expect(first).toHaveAttribute('aria-expanded', 'true')
    await second.focus()
    await second.press('ArrowDown')
    await expect(second).toHaveAttribute('aria-expanded', 'true')
    await expect(first).toHaveAttribute('aria-expanded', 'false')
    await expect(
        page.getByRole('textbox', { name: 'Optionen suchen' }),
    ).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(second).toHaveAttribute('aria-expanded', 'false')
    await expect(second).toBeFocused()
    await expect(page.locator('[popover]')).toHaveCount(0)
})
