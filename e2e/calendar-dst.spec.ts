import { expect, test } from '@playwright/test'

test.describe('calendar daylight saving time behavior', () => {
    test.use({ timezoneId: 'Europe/Berlin' })

    test.beforeEach(async ({ page }) => {
        await page.clock.install({
            time: new Date('2026-03-28T12:00:00+01:00'),
        })
        await page.goto('/calendar-dst.html')
    })

    test('clamps newly selected range endpoints to available bounded minutes', async ({
        page,
    }) => {
        const singleDialog = page.getByRole('dialog', {
            name: 'Minimum selection',
        })
        await page.getByRole('button', { name: 'Minimum selection' }).click()
        await singleDialog.locator('[data-calendar-date="2026-03-29"]').click()
        await singleDialog.getByRole('button', { name: 'Apply' }).click()
        await expect(page.getByTestId('minimum-selection-value')).toHaveText(
            '2026-03-29T03:00',
        )

        const rangeDialog = page.getByRole('dialog', { name: 'Bounded range' })
        await page.getByRole('button', { name: 'Bounded range' }).click()
        const springDay = rangeDialog.locator(
            '[data-calendar-date="2026-03-29"]',
        )
        await springDay.click()
        await springDay.click()
        await rangeDialog.getByRole('button', { name: 'Apply' }).click()
        await expect(page.getByTestId('bounded-range-value')).toHaveText(
            '2026-03-29T01:30|2026-03-29T01:59',
        )
    })

    test('moves a carried gap time to the nearest available minute', async ({
        page,
    }) => {
        const dialog = page.getByRole('dialog', { name: 'Carried time' })
        await page.getByRole('button', { name: 'Carried time' }).click()
        await dialog.locator('[data-calendar-date="2026-03-29"]').click()
        await dialog.getByRole('button', { name: 'Apply' }).click()

        await expect(page.getByTestId('carried-time-value')).toHaveText(
            '2026-03-29T03:00',
        )
    })

    test('disables a no-slot day, skips it by keyboard, and blocks invalid Apply', async ({
        page,
    }) => {
        const dialog = page.getByRole('dialog', {
            name: 'Available range',
        })
        await page.getByRole('button', { name: 'Available range' }).click()

        const unavailableDay = dialog.locator(
            '[data-calendar-date="2026-03-29"]',
        )
        await expect(unavailableDay).toBeDisabled()
        await unavailableDay.evaluate((element) =>
            (element as HTMLButtonElement).click(),
        )
        await expect(page.getByTestId('available-range-value')).toHaveText(
            '2026-03-28T02:30|',
        )

        const selectedDay = dialog.locator('[data-calendar-date="2026-03-28"]')
        await selectedDay.focus()
        await page.keyboard.press('ArrowRight')
        await expect(
            dialog.locator('[data-calendar-date="2026-03-30"]'),
        ).toBeFocused()
        await dialog.getByRole('button', { name: 'Apply' }).click()

        const invalidDialog = page.getByRole('dialog', {
            name: 'Invalid range',
        })
        await page.getByRole('button', { name: 'Invalid range' }).click()
        await expect(
            invalidDialog.getByRole('button', { name: 'Apply' }),
        ).toBeDisabled()
        await expect(page.getByTestId('invalid-range-value')).toHaveText(
            '2026-03-29T03:00|',
        )
    })

    test('keeps Apply disabled after bounds tighten until the value is adjusted', async ({
        page,
    }) => {
        const dialog = page.getByRole('dialog', { name: 'Dynamic bounds' })
        await page.getByRole('button', { name: 'Dynamic bounds' }).click()
        const apply = dialog.getByRole('button', { name: 'Apply' })

        await page
            .getByRole('button', { name: 'Tighten minimum to 13:00' })
            .click()
        await expect(apply).toBeDisabled()
        await expect(page.getByTestId('dynamic-bounds-value')).toHaveText(
            '2026-03-28T12:00',
        )

        const timeInput = dialog.getByRole('textbox', { name: 'Time 12:00' })
        await timeInput.focus()
        await timeInput.press('ArrowRight')
        await timeInput.press('3')
        await expect(
            dialog.getByRole('textbox', { name: 'Time 13:00' }),
        ).toBeVisible()
        await expect(apply).toBeEnabled()
        await apply.click()

        await expect(page.getByTestId('dynamic-bounds-value')).toHaveText(
            '2026-03-28T13:00',
        )
    })
})
