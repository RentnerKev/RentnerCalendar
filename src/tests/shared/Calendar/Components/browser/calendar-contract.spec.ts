import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'Europe/Berlin' })

test('applies provider sizing, semantic custom design, select slots and portal options', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    const single = page.locator('#contract-single')
    await expect(single).toHaveCSS('height', '48px')
    await expect(page.locator('#contract-range')).toHaveCSS('height', '36px')
    await expect(single).toHaveClass(/bg-emerald-950/)
    await single.click()
    const portals = page.getByTestId('calendar-portals')
    const dialog = portals.getByRole('dialog')
    await expect(dialog).toHaveCSS('z-index', '12000')
    await expect(dialog).toHaveClass(/calendar-owned-portal/)
    const month = dialog.getByRole('combobox', { name: 'Month' })
    await expect(month).toHaveClass(/bg-amber-100/)
    await expect(month).not.toHaveClass(/bg-emerald-950/)
    await month.click()
    const search = portals.getByRole('textbox', { name: 'Search options' })
    await expect(search).toHaveClass(/bg-amber-100/)
    await expect(portals.getByRole('listbox')).toHaveCSS('z-index', '12001')
    await page.keyboard.press('Escape')
    await page.keyboard.press('Escape')
    await expect(single).toBeFocused()
})

test('intersects instant and daily bounds for selection, time edits and Apply', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#contract-single').click()
    const dialog = page.getByRole('dialog')
    await expect(
        dialog.locator('[data-calendar-date="2026-10-15"]'),
    ).toBeDisabled()
    await expect(
        dialog.locator('[data-calendar-date="2026-10-17"]'),
    ).toBeDisabled()
    const time = dialog.getByRole('textbox', { name: /^Time / })
    await time.focus()
    await time.pressSequentially('0000')
    await expect(time).toHaveAttribute('aria-label', 'Time 12:30')
    await dialog.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByTestId('single-value')).toHaveText(
        '2026-10-16T10:30:00.000Z',
    )
    await page.locator('#contract-single').click()
    await page
        .getByRole('button', { name: 'Later minimum' })
        .evaluate((element: HTMLButtonElement) => element.click())
    await expect(dialog.getByRole('button', { name: 'Apply' })).toBeDisabled()
    await dialog.locator('[data-calendar-date="2026-10-16"]').click()
    await expect(time).toHaveAttribute('aria-label', 'Time 13:30')
    await dialog.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByTestId('single-value')).toHaveText(
        '2026-10-16T11:30:00.000Z',
    )
})

test('emits local ISO date ranges and explicit empty values', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#contract-range').click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('[data-calendar-date="2026-10-17"]').click()
    await expect(page.getByTestId('range-value')).toHaveText(
        '["2026-10-16","2026-10-17"]',
    )
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Clear' }).last().click()
    await expect(page.getByTestId('range-value')).toHaveText('undefined')
})

test('clamps both timed range endpoints inside the combined instant bounds', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#contract-range-instant').click()
    const dialog = page.getByRole('dialog')
    await expect(
        dialog.locator('[data-calendar-date="2026-10-17"]'),
    ).toBeDisabled()
    await dialog.locator('[data-calendar-date="2026-10-16"]').click()
    await expect(page.getByTestId('range-instant-value')).toHaveText(
        '["2026-10-16T10:30:00.000Z","2026-10-16T12:00:00.000Z"]',
    )
    const end = dialog.getByRole('textbox', { name: /^To / })
    await end.focus()
    await end.pressSequentially('0000')
    await expect(page.getByTestId('range-instant-value')).toHaveText(
        '["2026-10-16T10:30:00.000Z","2026-10-16T10:30:00.000Z"]',
    )
})

test('restarts a partial range when dynamic instant bounds invalidate its previous start', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#contract-dynamic-range').click()
    const dialog = page.getByRole('dialog')
    await page
        .getByRole('button', { name: 'Later range minimum' })
        .evaluate((button: HTMLButtonElement) => button.click())
    await expect(
        dialog.locator('[data-calendar-date="2026-10-16"]'),
    ).toBeDisabled()
    await dialog.locator('[data-calendar-date="2026-10-18"]').click()
    await expect(page.getByTestId('dynamic-range-value')).toHaveText(
        '["2026-10-17T22:00:00.000Z",null]',
    )
    await dialog.locator('[data-calendar-date="2026-10-19"]').click()
    await expect(page.getByTestId('dynamic-range-value')).toHaveText(
        '["2026-10-17T22:00:00.000Z","2026-10-19T21:59:59.999Z"]',
    )
})
