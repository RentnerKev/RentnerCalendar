import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'Europe/Berlin' })

test('skips unavailable days by keyboard and applies dynamic ISO presets', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#restricted-single').click()
    const dialog = page.getByRole('dialog')
    await expect(
        dialog.locator('[data-calendar-date="2026-10-17"]'),
    ).toBeDisabled()
    await expect(
        dialog.locator('[data-calendar-date="2026-10-20"]'),
    ).toBeDisabled()
    await dialog.locator('[data-calendar-date="2026-10-16"]').focus()
    await page.keyboard.press('ArrowRight')
    await expect(
        dialog.locator('[data-calendar-date="2026-10-19"]'),
    ).toBeFocused()
    await dialog.getByRole('button', { name: 'Blocked Tuesday' }).click()
    await expect(page.getByTestId('restricted-single-value')).toHaveText(
        '2026-10-16',
    )
    await dialog.getByRole('button', { name: 'Next Monday' }).click()
    await expect(page.getByTestId('restricted-single-value')).toHaveText(
        '2026-10-19',
    )
    await expect(page.locator('input[name="restrictedSingle"]')).toHaveValue(
        '2026-10-19',
    )
})

test('rejects ranges crossing unavailable dates through clicks and presets, then stages Apply', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#restricted-range').click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('[data-calendar-date="2026-10-19"]').click()
    await expect(page.getByTestId('restricted-range-value')).toHaveText(
        '["2026-10-16",null]',
    )
    await dialog.getByRole('button', { name: 'Across weekend' }).click()
    await dialog.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByTestId('restricted-range-value')).toHaveText(
        '["2026-10-16",null]',
    )
    await page.locator('#restricted-range').click()
    await dialog.getByRole('button', { name: 'Working week' }).click()
    await expect(page.getByTestId('restricted-range-value')).toHaveText(
        '["2026-10-16",null]',
    )
    await dialog.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByTestId('restricted-range-value')).toHaveText(
        '["2026-10-19","2026-10-23"]',
    )
})

test('revalidates Apply and time edits after the selected day becomes unavailable', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#contract-single').click()
    const dialog = page.getByRole('dialog')
    await page
        .getByRole('button', { name: 'Restrict current date' })
        .evaluate((element: HTMLButtonElement) => element.click())
    await expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled()
    await expect(dialog).toBeFocused()
    const time = dialog.getByRole('textbox', { name: /^Time / })
    await time.focus()
    await time.pressSequentially('1345')
    await expect(page.getByTestId('single-value')).toHaveText(
        '2026-10-16T11:00:00.000Z',
    )
    await expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled()
    await page.keyboard.press('Escape')
    await page.locator('#contract-single').click()
    await expect(time).toHaveAttribute('aria-label', 'Time 13:00')
})
