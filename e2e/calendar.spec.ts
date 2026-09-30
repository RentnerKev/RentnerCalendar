import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

function moveCalendarMonth(dateKey: string, monthOffset: number) {
    const [year, month, day] = dateKey.split('-').map(Number)
    const firstOfTargetMonth = new Date(
        Date.UTC(year, month - 1 + monthOffset, 1),
    )
    const lastDayOfTargetMonth = new Date(
        Date.UTC(
            firstOfTargetMonth.getUTCFullYear(),
            firstOfTargetMonth.getUTCMonth() + 1,
            0,
        ),
    ).getUTCDate()
    const target = new Date(
        Date.UTC(
            firstOfTargetMonth.getUTCFullYear(),
            firstOfTargetMonth.getUTCMonth(),
            Math.min(day, lastDayOfTargetMonth),
        ),
    )
    return `${String(target.getUTCFullYear()).padStart(4, '0')}-${String(target.getUTCMonth() + 1).padStart(2, '0')}-${String(target.getUTCDate()).padStart(2, '0')}`
}

test.describe('calendar playground', () => {
    test('opens the portal dialog and restores focus after Escape', async ({
        page,
    }) => {
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await trigger.click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await expect(dialog).toBeVisible()
        await expect(
            dialog.locator(
                '[data-calendar-day][aria-current="date"][tabindex="0"]',
            ),
        ).toBeFocused()
        await expect(trigger).toHaveAttribute('aria-controls', /-dialog$/)
        await expect(dialog).toHaveAttribute('aria-modal', 'true')

        await page.keyboard.press('Escape')
        await expect(dialog).toBeHidden()
        await expect(trigger).toBeFocused()
    })

    test('keeps keyboard focus inside the modal calendar dialog', async ({
        page,
    }) => {
        await page.goto('/')
        await page.locator('#appointment').click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await expect(dialog).toHaveAttribute('aria-modal', 'true')

        const tabStops = dialog.locator(
            'a[href], area[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex^="-"]), [contenteditable="true"]',
        )
        const firstTabStop = tabStops.first()
        const lastTabStop = tabStops.last()

        await firstTabStop.focus()
        await page.keyboard.press('Shift+Tab')
        await expect(lastTabStop).toBeFocused()

        await page.keyboard.press('Tab')
        await expect(firstTabStop).toBeFocused()
    })

    test('reports field blur only after focus leaves the calendar', async ({
        page,
    }) => {
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await trigger.click()
        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByText('Termin ist erforderlich.')).toHaveCount(0)

        await page.getByTestId('set-calendar-value').focus()
        await expect(page.getByText('Termin ist erforderlich.')).toBeVisible()
    })

    test('keeps the portal anchored to the trigger on a tall page', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 900, height: 700 })
        await page.goto('/')
        await page.evaluate(() => {
            document.body.style.minHeight = '1600px'
            const trigger = document.querySelector<HTMLElement>('#appointment')!
            trigger.style.position = 'fixed'
            trigger.style.top = '590px'
            trigger.style.left = '300px'
        })

        const trigger = page.locator('#appointment')
        await trigger.click()
        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await expect(dialog).toHaveCSS('position', 'fixed')
        await expect
            .poll(async () => {
                const triggerBox = await trigger.boundingBox()
                const dialogBox = await dialog.boundingBox()
                return triggerBox && dialogBox
                    ? triggerBox.y - (dialogBox.y + dialogBox.height)
                    : null
            })
            .toBeCloseTo(8, 0)

        await page.setViewportSize({ width: 900, height: 760 })
        await expect
            .poll(async () => {
                const triggerBox = await trigger.boundingBox()
                const dialogBox = await dialog.boundingBox()
                return triggerBox && dialogBox
                    ? triggerBox.y - (dialogBox.y + dialogBox.height)
                    : null
            })
            .toBeCloseTo(8, 0)
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
        const nextDayKey = await calendarDays.first().evaluate((button) => {
            const [year, month, dayOfMonth] = button
                .getAttribute('data-calendar-date')!
                .split('-')
                .map(Number)
            const nextDay = new Date(Date.UTC(year, month - 1, dayOfMonth + 1))
            return `${String(nextDay.getUTCFullYear()).padStart(4, '0')}-${String(nextDay.getUTCMonth() + 1).padStart(2, '0')}-${String(nextDay.getUTCDate()).padStart(2, '0')}`
        })
        await page.keyboard.press('ArrowRight')
        await expect(
            dialog.locator(`[data-calendar-date="${nextDayKey}"]`),
        ).toBeFocused()

        const timeInput = dialog.getByRole('textbox', { name: /Zeit/ })
        await timeInput.focus()
        await timeInput.pressSequentially('1234')
        await expect(timeInput).toHaveAttribute('aria-label', /12:34/)

        await expect(page.locator('input[name="appointment"]')).toHaveAttribute(
            'required',
        )
    })

    test('uses a roving date-grid tab stop and WAI-ARIA date navigation keys', async ({
        page,
    }) => {
        await page.goto('/')
        await page.locator('#appointment').click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        const grid = dialog.getByRole('grid')
        await expect(grid).toBeVisible()

        const focusedDay = dialog.locator('[data-calendar-day][tabindex="0"]')
        await expect(focusedDay).toBeFocused()
        await expect(
            dialog.locator('[data-calendar-day][tabindex="0"]'),
        ).toHaveCount(1)

        const nextDayKey = await focusedDay.evaluate((button) => {
            const [year, month, day] = button
                .getAttribute('data-calendar-date')!
                .split('-')
                .map(Number)
            const nextDay = new Date(Date.UTC(year, month - 1, day + 1))
            return `${String(nextDay.getUTCFullYear()).padStart(4, '0')}-${String(nextDay.getUTCMonth() + 1).padStart(2, '0')}-${String(nextDay.getUTCDate()).padStart(2, '0')}`
        })
        await page.keyboard.press('ArrowRight')
        await expect(
            dialog.locator(`[data-calendar-date="${nextDayKey}"]`),
        ).toBeFocused()

        const disabledDateKey = await dialog
            .locator('[data-calendar-day][tabindex="0"]')
            .evaluate((button) => {
                const [year, month, day] = button
                    .getAttribute('data-calendar-date')!
                    .split('-')
                    .map(Number)
                const nextDay = new Date(Date.UTC(year, month - 1, day + 1))
                return `${String(nextDay.getUTCFullYear()).padStart(4, '0')}-${String(nextDay.getUTCMonth() + 1).padStart(2, '0')}-${String(nextDay.getUTCDate()).padStart(2, '0')}`
            })
        const afterDisabledDateKey = await dialog
            .locator('[data-calendar-day][tabindex="0"]')
            .evaluate((button) => {
                const [year, month, day] = button
                    .getAttribute('data-calendar-date')!
                    .split('-')
                    .map(Number)
                const nextDay = new Date(Date.UTC(year, month - 1, day + 2))
                return `${String(nextDay.getUTCFullYear()).padStart(4, '0')}-${String(nextDay.getUTCMonth() + 1).padStart(2, '0')}-${String(nextDay.getUTCDate()).padStart(2, '0')}`
            })
        await dialog
            .locator(`[data-calendar-date="${disabledDateKey}"]`)
            .evaluate((button) => {
                ;(button as HTMLButtonElement).disabled = true
            })
        await page.keyboard.press('ArrowRight')
        await expect(
            dialog.locator(`[data-calendar-date="${afterDisabledDateKey}"]`),
        ).toBeFocused()

        await page.keyboard.press('Home')
        const firstDayOfWeek = dialog.locator(
            '[data-calendar-day][tabindex="0"]',
        )
        await expect
            .poll(() =>
                firstDayOfWeek.evaluate((button) => {
                    const date = new Date(
                        `${button.getAttribute('data-calendar-date')}T00:00:00Z`,
                    )
                    return date.getUTCDay()
                }),
            )
            .toBe(1)

        const dateBeforeMonthChange =
            await firstDayOfWeek.getAttribute('data-calendar-date')
        const nextMonthDate = moveCalendarMonth(dateBeforeMonthChange!, 1)
        await page.keyboard.press('PageDown')
        await expect(
            dialog.locator(`[data-calendar-date="${nextMonthDate}"]`),
        ).toBeFocused()

        const nextYearDate = moveCalendarMonth(nextMonthDate, 12)
        await page.keyboard.press('Shift+PageDown')
        await expect(
            dialog.locator(`[data-calendar-date="${nextYearDate}"]`),
        ).toBeFocused()
        await expect(grid).toHaveAttribute('aria-colcount', '7')
        await expect(dialog.getByRole('columnheader')).toHaveCount(7)
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
        await expect(
            page.locator(
                '#appointment-dialog [data-calendar-day][aria-pressed="true"][tabindex="0"]',
            ),
        ).toBeFocused()
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
