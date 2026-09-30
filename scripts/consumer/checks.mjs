export async function check({ page, expect }) {
    const singleTrigger = page.locator('#single-calendar')
    const singleCallback = page.getByTestId('single-callback')
    const singleBlurCount = page.getByTestId('single-blur-count')
    const initialSingle = '2030-12-24T19:00:00.000Z'

    await expect(singleCallback).toHaveText(initialSingle)
    await expect(singleBlurCount).toHaveText('0')

    const triggerStyle = await singleTrigger.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
            paddingLeft: Number.parseFloat(style.paddingLeft),
            borderTopWidth: Number.parseFloat(style.borderTopWidth),
        }
    })
    expect(triggerStyle.paddingLeft).toBeGreaterThan(0)
    expect(triggerStyle.borderTopWidth).toBeGreaterThan(0)

    await singleTrigger.click()
    const singleDialog = page.getByRole('dialog')
    const timeInput = singleDialog.locator(
        '[role="textbox"][aria-label^="Time "]',
    )
    const selectedDay = singleDialog.locator(
        '[data-calendar-date="2030-12-24"]',
    )
    await expect(selectedDay).toHaveAttribute('aria-pressed', 'true')

    await timeInput.focus()
    await timeInput.press('2')
    await expect(timeInput).toHaveAttribute('aria-label', 'Time 29:00')
    await expect(singleCallback).toHaveText(initialSingle)
    await expect(selectedDay).toHaveAttribute('aria-pressed', 'true')
    expect(
        await page
            .locator('#calendar-consumer-form')
            .evaluate((form) => new FormData(form).get('single')),
    ).toBe(initialSingle)

    // Leaving the time editor discards the invalid draft without firing the
    // calendar field's onBlur while focus remains in its portal.
    const monthSelect = singleDialog.getByRole('combobox', { name: 'Month' })
    await monthSelect.focus()
    await expect(timeInput).toHaveAttribute('aria-label', 'Time 19:00')
    await expect(singleBlurCount).toHaveText('0')

    await timeInput.focus()
    await timeInput.pressSequentially('2300')
    await expect(timeInput).toBeFocused()
    await expect(timeInput).toHaveAttribute('aria-label', 'Time 23:00')
    await expect(singleCallback).toHaveText('2030-12-24T23:00:00.000Z')
    expect(
        await page
            .locator('#calendar-consumer-form')
            .evaluate((form) => new FormData(form).get('single')),
    ).toBe('2030-12-24T23:00:00.000Z')
    await expect(selectedDay).toHaveAttribute('aria-pressed', 'true')

    await monthSelect.click()
    await expect(
        page.getByRole('textbox', { name: 'Search options' }),
    ).toBeFocused()
    await expect(singleBlurCount).toHaveText('0')
    await page.keyboard.press('Escape')
    await expect(singleBlurCount).toHaveText('0')
    await page.keyboard.press('Escape')
    await expect(singleDialog).toHaveCount(0)
    await page.getByTestId('outside-focus').focus()
    await expect(singleBlurCount).toHaveText('1')

    const rangeTrigger = page.locator('#range-calendar')
    await rangeTrigger.click()
    const rangeDialog = page.getByRole('dialog')
    const startTime = rangeDialog.locator(
        '[role="textbox"][aria-label^="From "]',
    )
    await expect(
        rangeDialog.locator('[data-calendar-date="2030-12-24"]'),
    ).toHaveAttribute('aria-pressed', 'true')

    await startTime.focus()
    await page.keyboard.press('1')
    await page.keyboard.press('2')
    await page.keyboard.press('5')
    await page.keyboard.press('9')
    await expect(startTime).toHaveAttribute('aria-label', 'From 12:59')
    await expect(startTime).toBeFocused()

    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('1')
    await page.keyboard.press('4')
    await page.keyboard.press('0')
    await page.keyboard.press('0')
    await expect(startTime).toHaveAttribute('aria-label', 'From 13:00')
    await expect(startTime).toBeFocused()

    const callbackHistory = JSON.parse(
        (await page.getByTestId('range-callback-history').textContent()) ??
            '[]',
    )
    expect(callbackHistory.length).toBeGreaterThan(0)
    for (const range of callbackHistory) {
        if (range === null) continue
        expect(range[0]).not.toBeNull()
        expect(range[1]).not.toBeNull()
        expect(Date.parse(range[0])).toBeLessThanOrEqual(Date.parse(range[1]))
    }

    const rangeFormValue = await page
        .locator('#calendar-consumer-form')
        .evaluate((form) => new FormData(form).get('range'))
    expect(JSON.parse(rangeFormValue)).toEqual([
        '2030-12-24T13:00:00.000Z',
        '2030-12-24T13:00:00.000Z',
    ])
}
