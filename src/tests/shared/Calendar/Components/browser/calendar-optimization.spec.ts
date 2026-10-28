import { expect, test } from '@playwright/test'

const fixtureLogic = '/src/Hooks/useCalendarOptimizationFixtureLogic.ts'

test.beforeEach(async ({ page }) => {
    await page.goto('/?calendar-optimization')
    await expect(page.getByTestId('calendar-optimization')).toBeVisible()
})

test('header options retain their references through unrelated commits and equal Date replacements', async ({
    page,
}) => {
    const result = await page.evaluate(async (url) => {
        const fixture = await import(url)
        fixture.captureHeaderReferences()
        const snapshots = []
        for (let index = 0; index < 20; index++) {
            fixture.runFixtureAction('tick')
            snapshots.push(fixture.readHeaderProbe())
        }
        fixture.runFixtureAction('same-date')
        snapshots.push(fixture.readHeaderProbe())
        return snapshots
    }, fixtureLogic)
    expect(result).toHaveLength(21)
    for (const snapshot of result) {
        expect(snapshot.sameYears).toBe(true)
        expect(snapshot.sameMonths).toBe(true)
        expect(snapshot.currentYear).toBe(2030)
    }
})

test('header sees a new year mutated on the same Date and updates only year options', async ({
    page,
}) => {
    const result = await page.evaluate(async (url) => {
        const fixture = await import(url)
        fixture.captureHeaderReferences()
        fixture.runFixtureAction('mutate-year')
        return fixture.readHeaderProbe()
    }, fixtureLogic)
    expect(result.sameYears).toBe(false)
    expect(result.sameMonths).toBe(true)
    expect(result.currentYear).toBe(2031)
    expect(result.firstYear).toBe('1981')
    expect(result.lastYear).toBe('2081')
    await expect(page.getByTestId('header-year')).toHaveText('2031')
})

test('header observes mutable month labels and locale changes but reuses equal month arrays', async ({
    page,
}) => {
    const result = await page.evaluate(async (url) => {
        const fixture = await import(url)
        fixture.captureHeaderReferences()
        fixture.runFixtureAction('mutate-month')
        const mutated = fixture.readHeaderProbe()
        fixture.captureHeaderReferences()
        fixture.runFixtureAction('clone-months')
        const equal = fixture.readHeaderProbe()
        fixture.runFixtureAction('english')
        const localized = fixture.readHeaderProbe()
        return { mutated, equal, localized }
    }, fixtureLogic)
    expect(result.mutated.sameYears).toBe(true)
    expect(result.mutated.sameMonths).toBe(false)
    expect(result.mutated.monthLabels[0]).toBe('Januar geändert')
    expect(result.equal.sameMonths).toBe(true)
    expect(result.localized.sameMonths).toBe(false)
    expect(result.localized.sameYears).toBe(true)
    expect(result.localized.monthLabels[0]).toBe('January')
    expect(result.localized.monthLabels.at(-1)).toBe('December')
    await expect(page.getByTestId('header-months')).toContainText(
        'January|February',
    )
})

test('search normalizes each label once then reuses it through ten nonempty query changes', async ({
    page,
}) => {
    await page.getByRole('combobox', { name: 'Optimization search' }).click()
    const search = page.getByRole('textbox', { name: 'Optionen suchen' })
    await page.evaluate(
        async (url) => (await import(url)).countLabelNormalization(),
        fixtureLogic,
    )
    await search.fill('p')
    const first = await page.evaluate(
        async (url) => (await import(url)).readLabelNormalization(),
        fixtureLogic,
    )
    expect(first).toBe(3)
    await page.evaluate(
        async (url) => (await import(url)).countLabelNormalization(),
        fixtureLogic,
    )
    await search.fill('pr')
    await search.fill('pro')
    await search.fill('prob')
    await search.fill('probe')
    await search.fill('probe ')
    await search.fill('probe l')
    await search.fill('probe la')
    await search.fill('probe lab')
    await search.fill('probe labe')
    await search.fill('probe label')
    const subsequent = await page.evaluate(
        async (url) => (await import(url)).readLabelNormalization(),
        fixtureLogic,
    )
    expect(subsequent).toBe(0)
    await expect(page.getByRole('option')).toHaveCount(3)
})

test('search keeps current values and ordering after same-reference edits, reorder and replacement', async ({
    page,
}) => {
    await page.getByRole('combobox', { name: 'Optimization search' }).click()
    const search = page.getByRole('textbox', { name: 'Optionen suchen' })
    await search.fill('probe')
    await expect(page.getByRole('option')).toHaveText([
        'Probe label ALPHAFirst family',
        'Probe label BETASecond family',
        'Probe label GAMMAThird family',
    ])
    await page.evaluate(
        async (url) => (await import(url)).runFixtureAction('reorder-options'),
        fixtureLogic,
    )
    await search.fill('probe label')
    await expect(page.getByRole('option')).toHaveText([
        'Probe label GAMMAThird family',
        'Probe label BETASecond family',
        'Probe label ALPHAFirst family',
    ])
    await page.evaluate(
        async (url) => (await import(url)).runFixtureAction('mutate-option'),
        fixtureLogic,
    )
    await search.fill('changed family')
    await expect(page.getByRole('option')).toHaveCount(1)
    await expect(page.getByRole('option')).toHaveAttribute(
        'data-value',
        'mutated',
    )
    await expect(page.getByRole('option')).toContainText('Probe label MUTATED')
    await search.fill('gamma')
    await expect(page.getByRole('option')).toHaveCount(0)
    await page.evaluate(
        async (url) => (await import(url)).runFixtureAction('replace-options'),
        fixtureLogic,
    )
    await search.fill('replacement family')
    await expect(page.getByRole('option')).toHaveCount(1)
    await expect(page.getByRole('option')).toHaveAttribute('data-value', 'new')
    await search.press('Enter')
    await expect(page.getByTestId('selected-value')).toHaveText('new')
})

test('cached search retains empty-result and IME keyboard behavior', async ({
    page,
}) => {
    const trigger = page.getByRole('combobox', { name: 'Optimization search' })
    await trigger.click()
    const search = page.getByRole('textbox', { name: 'Optionen suchen' })
    await search.fill('alpha')
    await search.dispatchEvent('compositionstart', { data: 'あ' })
    await search.dispatchEvent('keydown', { key: 'Enter', isComposing: true })
    await search.dispatchEvent('keydown', { key: 'Escape', isComposing: true })
    await expect(search).toBeVisible()
    await expect(page.getByTestId('selected-value')).toBeEmpty()
    await search.dispatchEvent('compositionend', { data: 'あ' })
    await search.fill('no such option')
    await expect(page.getByRole('option')).toHaveCount(0)
    await expect(
        page.getByText('Keine Ergebnisse', { exact: true }),
    ).toBeVisible()
    await search.press('ArrowDown')
    await search.press('Enter')
    await expect(search).toBeVisible()
    await expect(page.getByTestId('selected-value')).toBeEmpty()
    await search.fill('   ')
    await expect(page.getByRole('option')).toHaveCount(3)
    await search.fill('beta')
    await search.press('Enter')
    await expect(page.getByTestId('selected-value')).toHaveText('beta')
    await expect(trigger).toBeFocused()
})
