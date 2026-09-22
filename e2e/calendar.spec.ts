import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test.describe('calendar playground', () => {
    test('opens the portal dialog and restores focus after Escape', async ({
        page,
    }) => {
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await trigger.click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await expect(dialog).toBeVisible()
        await expect(trigger).toHaveAttribute('aria-controls', /-dialog$/)
        await expect(dialog).toHaveAttribute('aria-modal', 'false')

        await page.keyboard.press('Escape')
        await expect(dialog).toBeHidden()
        await expect(trigger).toBeFocused()
    })

    test('exposes selected days and native form metadata', async ({ page }) => {
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await trigger.click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        const day = dialog
            .getByRole('button', { name: /Datum auswählen:/ })
            .first()
        await day.click()
        await expect(
            dialog.locator(
                'button[aria-label^="Datum auswählen:"][aria-pressed="true"]',
            ),
        ).toHaveCount(1)

        const calendarDays = dialog.locator(
            '[data-calendar-day]:not(:disabled)',
        )
        await calendarDays.first().focus()
        await page.keyboard.press('ArrowRight')
        await expect(calendarDays.nth(1)).toBeFocused()

        const timeInput = dialog.getByRole('textbox', { name: /Zeit/ })
        await timeInput.focus()
        await timeInput.pressSequentially('1234')
        await expect(timeInput).toHaveAttribute('aria-label', /12:34/)

        await expect(page.locator('input[name="appointment"]')).toHaveAttribute(
            'required',
        )
    })

    test('synchronizes the visible month with controlled values', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('set-calendar-value').click()
        await page.locator('#appointment').click()

        await expect(
            page.getByRole('combobox', { name: 'Monat' }),
        ).toContainText('Dezember')
        await expect(
            page.getByRole('combobox', { name: 'Jahr' }),
        ).toContainText('2030')
    })

    test('has no axe violations in the open picker flow', async ({ page }) => {
        await page.goto('/')
        await page.locator('#appointment').click()

        const results = await new AxeBuilder({ page }).analyze()
        expect(results.violations).toEqual([])
    })

    test('keeps the dark playground stable under reduced motion', async ({
        page,
    }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' })
        await page.goto('/')

        await expect
            .poll(() =>
                page.evaluate(
                    () =>
                        getComputedStyle(document.documentElement).colorScheme,
                ),
            )
            .toBe('dark')
    })
})
