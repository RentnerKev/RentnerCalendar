import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'Europe/Berlin', viewport: { width: 390, height: 844 } })

test('keeps the native selection invisible while the end-time digit is selected', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#contract-range-instant').click()
    const dialog = page.getByRole('dialog')
    await dialog.locator('[data-calendar-date="2026-10-16"]').click()
    const time = dialog.getByRole('textbox', { name: /^To / })
    await time.focus()
    await expect(time).toHaveJSProperty('selectionStart', 0)
    await expect(time).toHaveJSProperty('selectionEnd', 1)

    const selected = await time.screenshot({ animations: 'disabled' })
    await time.evaluate((input) => {
        if (!(input instanceof HTMLInputElement))
            throw new Error('Expected the native time input')
        input.setSelectionRange(0, 0)
    })
    const collapsed = await time.screenshot({ animations: 'disabled' })

    expect(selected.equals(collapsed)).toBe(true)
})

test('accepts keydown-free input and paste while preserving bounds, keyboard edits and focus', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    await page.locator('#contract-single').click()
    const dialog = page.getByRole('dialog')
    const time = dialog.getByRole('textbox', { name: /^Time / })
    await expect(time).toHaveAttribute('type', 'text')
    await expect(time).toHaveAttribute('inputmode', 'numeric')
    await time.focus()
    await time.press('ArrowRight')
    await time.press('ArrowRight')
    // insertText emits native input without keydown, as software keyboards do.
    await page.keyboard.insertText('3')
    await expect(time).toHaveValue('1330')
    await expect(time).toBeFocused()
    await time.evaluate((input) => {
        const clipboardData = new DataTransfer()
        clipboardData.setData('text/plain', '13:45')
        const event = new ClipboardEvent('paste', { bubbles: true })
        // Firefox discards clipboardData passed to an untrusted event constructor.
        Object.defineProperty(event, 'clipboardData', { value: clipboardData })
        input.dispatchEvent(event)
    })
    await expect(time).toHaveValue('1345')
    await time.press('Delete')
    await expect(time).toHaveValue('1340')
    await time.press('Backspace')
    await expect(time).toHaveValue('1300')
    await time.fill('0000')
    await expect(time).toHaveValue('1230')
    await time.fill('9999')
    await expect(time).toHaveValue('9999')
    await dialog.getByRole('button', { name: 'Apply' }).focus()
    await expect(time).toHaveValue('1230')
    await dialog.getByRole('button', { name: 'Apply' }).click()
    await expect(page.getByTestId('single-value')).toHaveText(
        '2026-10-16T10:30:00.000Z',
    )
    await expect(page.locator('#contract-single')).toBeFocused()
})

test('touch activates the editable input and a native edit replaces the touched digit', async ({
    page,
    browserName,
}) => {
    test.skip(
        browserName === 'firefox',
        'Firefox does not emulate touch contexts',
    )
    const context = await page
        .context()
        .browser()!
        .newContext({
            hasTouch: true,
            viewport: { width: 390, height: 844 },
            timezoneId: 'Europe/Berlin',
        })
    try {
        const touchPage = await context.newPage()
        await touchPage.goto('http://127.0.0.1:4173/calendar-contract.html')
        await touchPage.locator('#contract-single').tap()
        const time = touchPage
            .getByRole('dialog')
            .getByRole('textbox', { name: /^Time / })
        const digit = await touchPage
            .locator('[data-time-digit="2"]')
            .boundingBox()
        await touchPage.touchscreen.tap(
            digit!.x + digit!.width / 2,
            digit!.y + digit!.height / 2,
        )
        await expect(time).toBeFocused()
        await touchPage.keyboard.insertText('3')
        await expect(time).toHaveValue('1330')
    } finally {
        await context.close()
    }
})
