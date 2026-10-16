import { expect, test } from '@playwright/test'

for (const theme of [
    { name: 'dark', surface: '#181a1f', foreground: '#ffffff' },
    { name: 'light', surface: '#ffffff', foreground: '#0f172a' },
]) {
    test(`keeps the apply label readable on a light accent in the ${theme.name} theme`, async ({
        page,
    }) => {
        await page.goto('/')
        await page.evaluate(({ surface, foreground }) => {
            const style = document.documentElement.style
            style.setProperty('--rentner-surface', surface)
            style.setProperty('--rentner-foreground', foreground)
            style.setProperty('--rentner-accent', '#fde047')
            style.setProperty('--rentner-accent-hover', '#facc15')
            style.setProperty('--rentner-accent-foreground', '#0f1014')
        }, theme)

        await page.locator('#appointment').click()
        const dialog = page.getByRole('dialog', { name: 'Kalender öffnen' })
        await expect(dialog).toHaveCSS(
            'background-color',
            theme.name === 'dark' ? 'rgb(24, 26, 31)' : 'rgb(255, 255, 255)',
        )
        await dialog.locator('[data-calendar-day][aria-current="date"]').click()

        const apply = dialog.getByRole('button', { name: 'Anwenden' })
        await expect(apply).toBeEnabled()
        await expect(apply).toHaveCSS('background-color', 'rgb(253, 224, 71)')
        await expect(apply).toHaveCSS('color', 'rgb(15, 16, 20)')

        await apply.hover()
        await expect(apply).toHaveCSS('background-color', 'rgb(250, 204, 21)')
        await expect(apply).toHaveCSS('color', 'rgb(15, 16, 20)')
    })
}
