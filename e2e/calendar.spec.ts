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

function moveCalendarDay(dateKey: string, dayOffset: number) {
    const [year, month, day] = dateKey.split('-').map(Number)
    const target = new Date(Date.UTC(year, month - 1, day + dayOffset))
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

    test('keeps month and year portals inside the field and modal focus loop', async ({
        page,
    }) => {
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await trigger.click()
        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })

        const checkPortal = async (label: 'Monat' | 'Jahr') => {
            await dialog.getByRole('combobox', { name: label }).click()
            const search = page.getByRole('textbox', {
                name: 'Optionen suchen',
            })
            await expect(search).toBeFocused()
            await expect(
                page.getByText('Termin ist erforderlich.'),
            ).toHaveCount(0)

            await page.keyboard.press('Tab')
            await expect
                .poll(() =>
                    page.evaluate(() => {
                        const active = document.activeElement
                        return Boolean(
                            active?.closest('[role="dialog"]') ||
                            active?.closest('[data-calendar-dialog-portal]'),
                        )
                    }),
                )
                .toBe(true)
            await expect(
                page.getByText('Termin ist erforderlich.'),
            ).toHaveCount(0)

            await page.keyboard.press('Escape')
            await expect(search).toBeHidden()
            await expect(
                dialog.getByRole('combobox', { name: label }),
            ).toBeFocused()
            await expect(
                page.getByText('Termin ist erforderlich.'),
            ).toHaveCount(0)
        }

        await checkPortal('Monat')
        await checkPortal('Jahr')
    })

    test('does not create a date by editing time before selecting a day', async ({
        page,
    }) => {
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await trigger.click()
        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        const timeInput = dialog.getByRole('textbox', { name: 'Zeit 00:00' })

        await expect(timeInput).toHaveAttribute('aria-disabled', 'true')
        await timeInput.focus()
        await timeInput.pressSequentially('1234')

        await expect(timeInput).toHaveAttribute('aria-label', 'Zeit 00:00')
        await expect(page.locator('input[name="appointment"]')).toHaveValue('')
    })

    test('keeps an invalid hour draft from rolling into the next day', async ({
        page,
    }) => {
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await trigger.click()
        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        const today = dialog.locator('[data-calendar-day][aria-current="date"]')
        const dateKey = await today.getAttribute('data-calendar-date')
        await today.click()

        const timeInput = dialog.getByRole('textbox', { name: /Zeit / })
        await timeInput.focus()
        await timeInput.pressSequentially('1900')
        await expect(timeInput).toHaveAttribute('aria-label', 'Zeit 19:00')

        await timeInput.press('ArrowLeft')
        await timeInput.press('ArrowLeft')
        await timeInput.press('ArrowLeft')
        await timeInput.press('2')
        await expect(timeInput).toHaveAttribute('aria-label', 'Zeit 29:00')

        await dialog.getByRole('button', { name: 'Anwenden' }).click()
        const [year, month, day] = dateKey!.split('-').map(Number)
        const expectedDate = new Date(year, month - 1, day).toLocaleDateString(
            'de-DE',
            { day: '2-digit', month: '2-digit', year: 'numeric' },
        )
        await expect(trigger).toContainText(expectedDate)
        await expect(trigger).toContainText('19:00')
    })

    test('keeps edited range times in chronological order', async ({
        page,
    }) => {
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await trigger.click()
        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await dialog.getByRole('button', { name: 'Zeitraum' }).click()

        const today = dialog.locator('[data-calendar-day][aria-current="date"]')
        const dateKey = await today.getAttribute('data-calendar-date')
        await today.click()
        await dialog.locator(`[data-calendar-date="${dateKey}"]`).click()

        const startTime = dialog.getByRole('textbox', { name: /Von / })
        const endTime = dialog.getByRole('textbox', { name: /Bis / })
        await startTime.focus()
        await startTime.pressSequentially('1900')
        await endTime.focus()
        await endTime.pressSequentially('1800')

        await expect(startTime).toHaveAttribute('aria-label', 'Von 19:00')
        await expect(endTime).toHaveAttribute('aria-label', 'Bis 19:00')
        await dialog.getByRole('button', { name: 'Anwenden' }).click()

        const [year, month, day] = dateKey!.split('-').map(Number)
        const expectedDate = new Date(year, month - 1, day).toLocaleDateString(
            'de-DE',
            { day: '2-digit', month: '2-digit', year: 'numeric' },
        )
        await expect(page.locator('input[name="appointment"]')).toHaveValue(
            `${expectedDate} 19:00 - ${expectedDate} 19:00`,
        )
    })

    test('keeps the portal anchored to the trigger on a tall page', async ({
        page,
    }) => {
        await page.setViewportSize({ width: 900, height: 700 })
        await page.goto('/')
        const trigger = page.locator('#appointment')
        await expect(trigger).toBeVisible()
        await trigger.evaluate((element) => {
            document.body.style.minHeight = '1600px'
            const target = element as HTMLElement
            target.style.position = 'fixed'
            target.style.top = '590px'
            target.style.left = '300px'
        })

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

    test('keeps the modal calendar and header inside narrow viewports when scrolling', async ({
        page,
    }) => {
        const checkViewport = async (scenario: {
            width: number
            height: number
            triggerTop: number
        }) => {
            await page.setViewportSize({
                width: scenario.width,
                height: scenario.height,
            })
            await page.goto('/')

            const trigger = page.locator('#appointment')
            await expect(trigger).toBeVisible()
            await trigger.evaluate((element, triggerTop) => {
                const target = element as HTMLElement
                document.body.style.minHeight = '1200px'
                target.style.position = 'fixed'
                target.style.left = '16px'
                target.style.top = `${triggerTop}px`
                target.style.width = 'calc(100vw - 32px)'
            }, scenario.triggerTop)

            await expect(trigger).toHaveCSS('left', '16px')
            await expect(trigger).toHaveCSS('top', `${scenario.triggerTop}px`)
            await trigger.click()

            const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
            await expect(dialog).toBeVisible()
            await expect
                .poll(async () => {
                    const bounds = await dialog.boundingBox()
                    return Boolean(
                        bounds &&
                        bounds.x >= 0 &&
                        bounds.y >= 0 &&
                        bounds.x + bounds.width <= scenario.width &&
                        bounds.y + bounds.height <= scenario.height,
                    )
                })
                .toBe(true)

            const month = dialog.getByRole('combobox', { name: 'Monat' })
            const headerBounds = await month.boundingBox()
            expect(headerBounds).not.toBeNull()
            expect(headerBounds!.x).toBeGreaterThanOrEqual(0)
            expect(headerBounds!.y).toBeGreaterThanOrEqual(0)
            expect(headerBounds!.x + headerBounds!.width).toBeLessThanOrEqual(
                scenario.width,
            )
            expect(headerBounds!.y + headerBounds!.height).toBeLessThanOrEqual(
                scenario.height,
            )

            await month.click()
            await expect(
                page.getByRole('textbox', { name: 'Optionen suchen' }),
            ).toBeVisible()
        }

        await checkViewport({ width: 320, height: 400, triggerTop: 180 })
        await checkViewport({ width: 320, height: 640, triggerTop: 500 })

        await page.setViewportSize({ width: 320, height: 400 })
        await page.goto('/')

        const trigger = page.locator('#appointment')
        await expect(trigger).toBeVisible()
        await trigger.evaluate((element) => {
            const scrollContainer = element.parentElement

            if (!scrollContainer) {
                throw new Error('Calendar trigger must have a parent container')
            }

            scrollContainer.style.position = 'fixed'
            scrollContainer.style.left = '16px'
            scrollContainer.style.top = '0'
            scrollContainer.style.width = '288px'
            scrollContainer.style.height = '400px'
            scrollContainer.style.overflowY = 'auto'

            const spacer = document.createElement('div')
            spacer.style.height = '800px'
            scrollContainer.insertBefore(spacer, element)
            const trailingSpacer = document.createElement('div')
            trailingSpacer.style.height = '800px'
            scrollContainer.append(trailingSpacer)
            scrollContainer.scrollTop = 720
        })

        await expect
            .poll(async () => {
                const bounds = await trigger.boundingBox()
                return Boolean(
                    bounds && bounds.y >= 0 && bounds.y + bounds.height <= 400,
                )
            })
            .toBe(true)
        await trigger.click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await expect(dialog).toBeVisible()

        const anchorAndDialogFit = async (
            anchorPosition: 'above' | 'below',
        ) => {
            const anchorBounds = await trigger.boundingBox()
            const dialogBounds = await dialog.boundingBox()

            return Boolean(
                anchorBounds &&
                dialogBounds &&
                (anchorPosition === 'above'
                    ? anchorBounds.y + anchorBounds.height <= 0
                    : anchorBounds.y >= 400) &&
                dialogBounds.x >= 0 &&
                dialogBounds.y >= 0 &&
                dialogBounds.x + dialogBounds.width <= 320 &&
                dialogBounds.y + dialogBounds.height <= 400,
            )
        }

        await trigger.evaluate((element) => {
            element.parentElement!.scrollTop = 0
        })
        await expect.poll(() => anchorAndDialogFit('below')).toBe(true)

        await trigger.evaluate((element) => {
            element.parentElement!.scrollTop = 1000
        })
        await expect.poll(() => anchorAndDialogFit('above')).toBe(true)
    })

    test('does not match a shadow class as a trigger width utility', async ({
        page,
    }) => {
        await page.goto('/?calendar-width-test')

        const trigger = page.locator('#appointment')
        await expect(trigger).toHaveCSS('width', '512px')

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await trigger.click()
        await expect(dialog).toBeVisible()
        await expect(dialog).toHaveCSS('width', '340px')

        await page.keyboard.press('Escape')
        await expect(dialog).toBeHidden()
        await page.getByTestId('toggle-calendar-shadow-class').click()
        await trigger.click()
        await expect(dialog).toBeVisible()
        await expect(dialog).toHaveCSS('width', '340px')

        await page.keyboard.press('Escape')
        const widthUtilityToggle = page.getByTestId(
            'cycle-calendar-width-utility',
        )
        await widthUtilityToggle.click()
        await expect(trigger).toHaveCSS('width', '512px')
        await trigger.click()
        await expect(dialog).toBeVisible()
        await expect(dialog).toHaveCSS('width', '512px')

        await page.keyboard.press('Escape')
        await widthUtilityToggle.click()
        await expect(trigger).toHaveCSS('width', '512px')
        await trigger.click()
        await expect(dialog).toBeVisible()
        await expect(dialog).toHaveCSS('width', '512px')
    })

    test('exposes a read-only native trigger as disabled without aria-readonly', async ({
        page,
    }) => {
        await page.goto('/?calendar-readonly-test')

        const trigger = page.locator('#appointment')
        await expect(trigger).toHaveAttribute('aria-disabled', 'true')
        await expect(trigger).not.toHaveAttribute('aria-readonly')
        await expect(trigger).toHaveJSProperty('tabIndex', 0)

        const results = await new AxeBuilder({ page })
            .include('#appointment')
            .analyze()
        expect(results.violations).toEqual([])

        await trigger.evaluate((button: HTMLButtonElement) => button.click())
        await expect(page.getByRole('dialog')).toHaveCount(0)
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

    test('announces interior dates as selected members of a range', async ({
        page,
    }) => {
        await page.goto('/')
        await page.locator('#appointment').click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await dialog.getByRole('button', { name: 'Zeitraum' }).click()
        const todayKey = await dialog
            .locator('[data-calendar-day][aria-current="date"]')
            .getAttribute('data-calendar-date')
        const startKey = moveCalendarDay(todayKey!, 0)
        const middleKey = moveCalendarDay(todayKey!, 1)
        const endKey = moveCalendarDay(todayKey!, 2)

        await dialog.locator(`[data-calendar-date="${startKey}"]`).click()
        await dialog.locator(`[data-calendar-date="${endKey}"]`).click()

        const grid = dialog.getByRole('grid')
        const middleDay = dialog.locator(`[data-calendar-date="${middleKey}"]`)
        await expect(grid).toHaveAttribute('aria-multiselectable', 'true')
        await expect(middleDay).toHaveAttribute('aria-pressed', 'true')
        await expect(middleDay).toHaveAttribute(
            'aria-label',
            /im ausgewählten Zeitraum/,
        )
        await expect
            .poll(() =>
                middleDay.evaluate((button) =>
                    button.parentElement?.getAttribute('aria-selected'),
                ),
            )
            .toBe('true')
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

    test('disables Apply when a dynamic date bound excludes the selected day', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('set-calendar-value').click()
        await page.locator('#appointment').click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        const selectedDay = dialog.locator('[data-calendar-date="2030-12-24"]')
        await expect(selectedDay).toBeFocused()

        await page
            .getByTestId('set-calendar-min-date')
            .evaluate((button: HTMLButtonElement) => button.click())

        await expect(selectedDay).toBeDisabled()
        await expect(
            dialog.getByRole('button', { name: 'Anwenden' }),
        ).toBeDisabled()
    })

    test('moves focus to an available day when dynamic bounds disable the focused day', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('set-calendar-value').click()
        await page.locator('#appointment').click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        const selectedDay = dialog.locator('[data-calendar-date="2030-12-24"]')
        const nextAvailableDay = dialog.locator(
            '[data-calendar-date="2030-12-25"]',
        )
        await expect(selectedDay).toBeFocused()

        await page
            .getByTestId('set-calendar-min-date')
            .evaluate((button: HTMLButtonElement) => button.click())

        await expect(selectedDay).toBeDisabled()
        await expect(nextAvailableDay).toBeFocused()
    })

    test('keeps focus on a header control when updated bounds disable the last focused day', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('set-calendar-value').click()
        await page.locator('#appointment').click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        const previousMonth = dialog.getByRole('button', {
            name: 'Vorheriger Monat',
        })
        await previousMonth.focus()

        await page
            .getByTestId('set-calendar-min-date')
            .evaluate((button: HTMLButtonElement) => button.click())

        await expect(
            dialog.locator('[data-calendar-date="2030-12-24"]'),
        ).toBeDisabled()
        await expect(previousMonth).toBeFocused()

        const timeInput = dialog.getByRole('textbox', {
            name: /^Zeit /,
        })
        await timeInput.focus()
        await page
            .getByTestId('set-calendar-min-date-after-view')
            .evaluate((button: HTMLButtonElement) => button.click())

        await expect(timeInput).toBeFocused()
    })

    test('focuses the dialog when changed bounds disable every visible day', async ({
        page,
    }) => {
        await page.goto('/')
        await page.getByTestId('set-calendar-value').click()
        await page.locator('#appointment').click()

        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await expect(
            dialog.locator('[data-calendar-date="2030-12-24"]'),
        ).toBeFocused()

        await page
            .getByTestId('set-calendar-min-date-after-view')
            .evaluate((button: HTMLButtonElement) => button.click())

        await expect(
            dialog.locator('[data-calendar-day][tabindex="0"]'),
        ).toHaveCount(0)
        await expect(dialog).toBeFocused()
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
