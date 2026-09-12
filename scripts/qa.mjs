import { chromium } from '@playwright/test'

const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true })
const results = []
const errors = []
const record = (name, pass, details = {}) => results.push({ name, pass, ...details })
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
// Capture the generated mailto URI without opening an external email application.
await context.route('**/src/components/ContactDialog.tsx*', async (route) => {
  const response = await route.fetch()
  const body = await response.text()
  await route.fulfill({ response, body: body.replace(/window\.location\.href\s*=\s*/, 'window.__qaMailto = ') })
})
const page = await context.newPage()
page.on('pageerror', error => errors.push(error.message))
await page.goto('http://localhost:5173', { waitUntil: 'networkidle' })
await page.waitForTimeout(1700)

for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
  await page.waitForTimeout(350)
  const overflow = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth, body: document.body.scrollWidth }))
  record(`No horizontal overflow at ${width}px`, overflow.document <= width && overflow.body <= width, overflow)
}

for (const width of [1440, 390]) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
  await page.getByRole('button', { name: 'MENU', exact: true }).click()
  record(`Menu opens at ${width}px`, await page.locator('.menu-dialog').evaluate(el => el.open))
  await page.keyboard.press('Escape')
  record(`Menu Escape restores focus at ${width}px`, await page.locator('.menu-trigger').evaluate(el => document.activeElement === el))
  for (const label of ['Projects', 'Services', 'About', 'Home']) {
    await page.getByRole('button', { name: 'MENU', exact: true }).click()
    await page.locator('.menu-links').getByRole('link', { name: new RegExp(label, 'i') }).click()
    await page.waitForTimeout(1800)
    const state = await page.evaluate((id) => ({ open: document.querySelector('.menu-dialog').open, hash: location.hash, top: document.querySelector(id).getBoundingClientRect().top }), `#${label.toLowerCase()}`)
    record(`${width}px menu ${label} navigates`, !state.open && state.hash === `#${label.toLowerCase()}` && Math.abs(state.top) < 10, state)
  }
}

await page.setViewportSize({ width: 1440, height: 900 })
for (const [index, type] of ['Live events', 'Private celebrations', 'Brand experiences'].entries()) {
  const button = page.locator('.trn-service__button').nth(index)
  await button.focus()
  await page.waitForTimeout(550)
  const focusedVisibility = await page.locator('.trn-service__details').nth(index).evaluate(el => getComputedStyle(el).opacity)
  record(`Service ${type} keyboard reveals description`, focusedVisibility === '1', { opacity: focusedVisibility })
  await page.keyboard.press('Enter')
  const opened = await page.locator('.contact-dialog').evaluate(el => el.open)
  const selected = await page.locator('#contact-type').inputValue()
  record(`Service ${type} opens matching enquiry`, opened && selected === type, { selected })
  await page.keyboard.press('Escape')
  record(`Contact Escape restores ${type} focus`, await button.evaluate(el => document.activeElement === el))
}

await page.locator('.header-contact').click()
await page.getByRole('button', { name: 'Prepare my enquiry' }).click()
const requiredState = await page.evaluate(() => ({ valid: document.querySelector('.contact-form').checkValidity(), active: document.activeElement.id, mailto: window.__qaMailto ?? null }))
record('Empty enquiry is blocked by required validation', !requiredState.valid && requiredState.active === 'contact-name' && requiredState.mailto === null, requiredState)
await page.locator('#contact-name').fill('QA Example')
await page.locator('#contact-email').fill('invalid-email')
await page.locator('#contact-message').fill('Testing an event enquiry, not a real request.')
await page.getByRole('button', { name: 'Prepare my enquiry' }).click()
const invalid = await page.locator('#contact-email').evaluate(el => !el.validity.valid && document.activeElement === el)
record('Invalid email is blocked', invalid)
await page.locator('#contact-email').fill('qa@example.com')
await page.locator('#contact-type').selectOption('Private celebrations')
await page.locator('#contact-date').fill('2026-12-31')
await page.getByRole('button', { name: 'Prepare my enquiry' }).click()
const mailto = await page.evaluate(() => window.__qaMailto ?? '')
const decoded = decodeURIComponent(mailto)
record('Enquiry prepares complete mailto URI', decoded.startsWith('mailto:trnevents@gmail.com?') && decoded.includes('Private celebrations | QA Example') && decoded.includes('Email: qa@example.com') && decoded.includes('2026-12-31') && decoded.includes('Testing an event enquiry'), { mailto: decoded })
await page.getByRole('button', { name: 'Close enquiry form' }).click()
record('Contact close button restores header trigger focus', await page.locator('.header-contact').evaluate(el => document.activeElement === el))

await page.getByRole('button', { name: 'Turn sound on', exact: true }).click()
record('Sound toggles on', await page.getByRole('button', { name: 'Turn sound off', exact: true }).getAttribute('aria-pressed') === 'true')
await page.getByRole('button', { name: 'Turn sound off', exact: true }).click()
record('Sound toggles off', await page.getByRole('button', { name: 'Turn sound on', exact: true }).getAttribute('aria-pressed') === 'false')

await page.emulateMedia({ reducedMotion: 'reduce' })
await page.waitForTimeout(400)
for (const width of [390, 768, 1024, 1440]) {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 900 })
  await page.waitForTimeout(350)
  const state = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, hiddenReveals: [...document.querySelectorAll('[data-reveal]')].filter(el => Number(getComputedStyle(el).opacity) < 1).length, hiddenWords: [...document.querySelectorAll('.soft-word')].filter(el => Number(getComputedStyle(el).opacity) < 1).length, projectCount: [...document.querySelectorAll('.project-card')].filter(el => { const bounds = el.getBoundingClientRect(); return bounds.width > 0 && bounds.left >= 0 && bounds.right <= innerWidth }).length, heroTransform: getComputedStyle(document.querySelector('.hero-title .word-inner')).transform }))
  record(`Reduced motion readable at ${width}px`, !state.overflow && state.hiddenReveals === 0 && state.hiddenWords === 0 && state.projectCount === 3 && state.heroTransform === 'none', state)
}
await page.getByRole('button', { name: 'Explore live events', exact: true }).click()
record('Project dialog opens', await page.locator('.project-dialog').evaluate(el => el.open))
await page.keyboard.press('Escape')
record('Project dialog Escape restores focus', await page.getByRole('button', { name: 'Explore live events', exact: true }).evaluate(el => document.activeElement === el))
const brokenImages = await page.locator('img').evaluateAll(images => images.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src))
record('All images loaded', brokenImages.length === 0, { brokenImages })
record('No JavaScript runtime errors', errors.length === 0, { errors })
console.log(JSON.stringify({ passed: results.filter(result => result.pass).length, total: results.length, failures: results.filter(result => !result.pass), results }, null, 2))
await browser.close()
