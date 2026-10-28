import { expect, test } from '@playwright/test'

test('filters the native month list, navigates by keyboard and restores its trigger', async ({
    page,
}) => {
    await page.goto('/')
    await page.locator('#appointment').click()
    const calendar = page.getByRole('dialog', { name: 'Kalender öffnen' })
    const month = calendar.getByRole('combobox', { name: 'Monat' })
    await month.press('ArrowDown')
    const search = page.getByRole('textbox', { name: 'Optionen suchen' })
    await expect(search).toBeFocused()
    await search.fill('März')
    await expect(page.getByRole('option')).toHaveCount(1)
    await search.press('ArrowDown')
    await expect(page.getByRole('option', { name: 'März' })).toBeFocused()
    await page.keyboard.press('Enter')
    await expect(search).toBeHidden()
    await expect(month).toContainText('März')
    await expect(month).toBeFocused()
    await expect(calendar).toBeVisible()
    await expect(page.getByText('Termin ist erforderlich.')).toHaveCount(0)
})

test('keeps IME composition and empty search results from committing a year', async ({
    page,
}) => {
    await page.goto('/')
    await page.locator('#appointment').click()
    const year = page.getByRole('combobox', { name: 'Jahr' })
    const previous = await year.textContent()
    await year.click()
    const search = page.getByRole('textbox', { name: 'Optionen suchen' })
    await search.fill('2035')
    await search.dispatchEvent('keydown', { key: 'Enter', isComposing: true })
    await expect(search).toBeVisible()
    await expect(year).toHaveText(previous!)
    await search.fill('no matching year')
    await search.press('ArrowDown')
    await search.press('Enter')
    await expect(search).toBeVisible()
    await expect(page.getByRole('option')).toHaveCount(0)
    await search.fill('2035')
    await search.press('Enter')
    await expect(year).toContainText('2035')
    await expect(year).toBeFocused()
})

test('dismisses a native month popup on an outside pointer without closing the calendar', async ({
    page,
}) => {
    await page.goto('/')
    await page.locator('#appointment').click()
    const calendar = page.getByRole('dialog', { name: 'Kalender öffnen' })
    await calendar.getByRole('combobox', { name: 'Monat' }).click()
    await expect(
        page.getByRole('textbox', { name: 'Optionen suchen' }),
    ).toBeVisible()
    const next = calendar.getByRole('button', { name: 'Nächster Monat' })
    const month = calendar.getByRole('combobox', { name: 'Monat' })
    const previousMonth = await month.textContent()
    await next.click()
    await expect(
        page.getByRole('textbox', { name: 'Optionen suchen' }),
    ).toBeHidden()
    // Safari does not focus a clicked button. Assert the actual outside action
    // and that dismissal never redirects focus to the old combobox instead.
    await expect(month).not.toHaveText(previousMonth!)
    await expect(month).not.toBeFocused()
    await expect(calendar).toBeVisible()
})

test('keeps the native popup anchored inside a transformed custom portal and narrow viewport', async ({
    page,
}) => {
    await page.setViewportSize({ width: 360, height: 480 })
    await page.goto('/calendar-contract.html')
    await page.getByTestId('calendar-portals').evaluate((element) => {
        element.style.transform = 'translate(12px, 6px) scale(0.9)'
    })
    await page.locator('#contract-single').click()
    const month = page.getByRole('combobox', { name: 'Month' })
    await month.click()
    const listbox = page.getByRole('listbox')
    const popup = listbox.locator('xpath=../..')
    await expect(popup).toHaveJSProperty('popover', 'manual')
    await expect
        .poll(async () => {
            const anchor = await month.boundingBox()
            const bounds = await popup.boundingBox()
            return Boolean(
                anchor &&
                bounds &&
                bounds.x >= 0 &&
                bounds.y >= 0 &&
                bounds.x + bounds.width <= 361 &&
                bounds.y + bounds.height <= 481 &&
                Math.abs(
                    bounds.x -
                        Math.max(8, Math.min(anchor.x, 360 - bounds.width - 8)),
                ) < 2,
            )
        })
        .toBe(true)
    await page.setViewportSize({ width: 320, height: 400 })
    await expect
        .poll(async () => {
            const bounds = await popup.boundingBox()
            return Boolean(
                bounds &&
                bounds.x >= 0 &&
                bounds.x + bounds.width <= 321 &&
                bounds.y >= 0 &&
                bounds.y + bounds.height <= 401,
            )
        })
        .toBe(true)
    await page.keyboard.press('Escape')
    await expect(month).toBeFocused()
})
