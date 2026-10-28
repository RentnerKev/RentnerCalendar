import { expect, test, type Locator } from '@playwright/test'

async function expectClearInside(trigger: Locator, clear: Locator) {
    await expect
        .poll(async () => {
            const field = await trigger.boundingBox()
            const action = await clear.boundingBox()
            if (!field || !action) return false
            return (
                action.x >= field.x &&
                action.y >= field.y &&
                action.x + action.width <= field.x + field.width &&
                action.y + action.height <= field.y + field.height &&
                Math.abs(field.x + field.width - action.x - action.width - 8) <
                    1 &&
                Math.abs(
                    action.y + action.height / 2 - field.y - field.height / 2,
                ) < 1
            )
        })
        .toBe(true)
    const text = await trigger.locator('span[id$="-value"]').boundingBox()
    const action = await clear.boundingBox()
    expect(text).not.toBeNull()
    expect(text!.x + text!.width).toBeLessThanOrEqual(action!.x)
}

test('keeps the range clear action inside a narrow field in a wide container', async ({
    page,
}) => {
    await page.setViewportSize({ width: 1100, height: 800 })
    await page.goto('/calendar-contract.html')
    const range = page.locator('#contract-range')
    const clear = range.locator('..').getByRole('button', { name: 'Clear' })
    await range.evaluate((element) => {
        element.parentElement!.style.width = '800px'
        element.style.width = '300px'
        element.style.height = '54px'
    })
    await expect(range).toHaveCSS('width', '300px')
    await expectClearInside(range, clear)

    await range.evaluate((element) => {
        element.style.width = '160px'
    })
    await expectClearInside(range, clear)
    expect(
        await range
            .locator('span[id$="-value"]')
            .evaluate((element) => element.scrollWidth > element.clientWidth),
    ).toBe(true)

    await clear.click()
    await expect(page.getByTestId('range-value')).toHaveText('undefined')
    await expect(clear).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(page.locator('input[name="range"]')).toHaveValue('')
})

test('keeps clear aligned through relative widths, resizing and transforms with native keyboard activation', async ({
    page,
}) => {
    await page.goto('/calendar-contract.html')
    const range = page.locator('#contract-range')
    const clear = range.locator('..').getByRole('button', { name: 'Clear' })
    async function checkWidth(width: string, expectedWidth?: string) {
        await range.evaluate((element, fieldWidth) => {
            element.parentElement!.style.width = '800px'
            element.style.width = fieldWidth
        }, width)
        await expectClearInside(range, clear)
        if (expectedWidth) await expect(range).toHaveCSS('width', expectedWidth)
    }
    await checkWidth('50%', '400px')
    await checkWidth('100%', '800px')
    await checkWidth('calc(100% - 40px)', '760px')
    await checkWidth('auto')
    await page.setViewportSize({ width: 320, height: 640 })
    await range.evaluate((element) => {
        element.parentElement!.style.width = '260px'
        element.style.width = '100%'
    })
    await expectClearInside(range, clear)
    await range.evaluate((element) => {
        element.parentElement!.style.transform = 'translateX(5px)'
    })
    await expectClearInside(range, clear)

    await range.focus()
    await page.keyboard.press('Tab')
    await expect(clear).toBeFocused()
    await page.keyboard.press('Space')
    await expect(page.getByTestId('range-value')).toHaveText('undefined')
    await expect(page.getByRole('dialog')).toHaveCount(0)
})
