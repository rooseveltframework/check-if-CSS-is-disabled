const { test, expect, firefox } = require('@playwright/test')
const path = require('path')
const fs = require('fs')
const express = require('express')
let server
let counter = 0

test.describe('check-if-css-is-disabled', () => {
  test.beforeAll(async () => {
    const app = express()
    app.use(express.static(path.resolve(__dirname, '../')))
    server = app.listen(3000)
  })

  test.afterAll(async () => {
    server.close()
  })

  test.beforeEach(async ({ page }) => {
    page.on('console', msg => {
      // suppress specific errors
      const text = msg.text()
      if (text.includes('net::ERR_EMPTY_RESPONSE') ||
          text.includes('MIME type') ||
          text.includes('X-Content-Type-Options')) {
        return
      }
      // print everything else, including the test page's console logs
      console.log(msg.text())
    })
  })

  test.afterEach(async ({ page }) => {
    if (process.env.NYC_PROCESS_ID) {
      // extract coverage data
      const coverage = await page.evaluate(() => window.__coverage__)
      // write coverage data to a file
      if (coverage) {
        counter++
        fs.writeFileSync(path.join(process.cwd(), '.nyc_output', `coverage-${counter}.json`), JSON.stringify(coverage))
      }
    }
  })

  test('should detect <link> tag does load css', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/linkTagLoads.html')
    const result = await page.evaluate(() => {
      const cssIsDisabled = window.checkIfCssIsDisabled({ justCheck: true })
      return cssIsDisabled
    })
    expect(result).toBe(false)
  })

  test('should detect <link> tag didn\'t load css', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/linkTagDoesNotLoad.html')
    const result = await page.evaluate(() => {
      const cssIsDisabled = window.checkIfCssIsDisabled({ justCheck: true })
      return cssIsDisabled
    })
    expect(result).toBe(true)
  })

  test('should detect <link> tag didn\'t load css and stop execution of the JS', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/linkTagDoesNotLoad.html')
    let error
    try {
      await page.evaluate(() => {
        const cssIsDisabled = window.checkIfCssIsDisabled()
        return cssIsDisabled
      })
    } catch (e) {
      error = e
    }
    expect(error).toBeDefined()
    expect(error.message).toContain('CSS is disabled. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.')
  })

  test('should detect <link> tag didn\'t load css and listen for cssDisabled event', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/linkTagDoesNotLoad.html')
    const result = await page.evaluate(() => {
      let eventData
      window.addEventListener('cssDisabled', (event) => {
        eventData = event.detail.message
      })
      const cssIsDisabled = window.checkIfCssIsDisabled({ justCheck: true })
      return { cssIsDisabled, eventData }
    })
    expect(result.cssIsDisabled).toBe(true)
    expect(result.eventData).toContain('At least one stylesheet failed to load. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.')
  })

  // TODO: this test does not work; this feature needs to be manually tested by opening test/linkTagLoads.html and typing `checkIfCssIsDisabled()` into the browser console
  test.skip('should detect when CSS is disabled in Firefox', async ({ browserName }) => {
    if (browserName !== 'firefox') test.skip() // chrome does not have this feature
    const browser = await firefox.launch({
      headless: false, // set to false to see the browser
      firefoxUserPrefs: {
        'font.size.variable.x-western': 250, // works
        'layout.css.enabled': false // does not work; this firefox pref appears to no longer exist in about:config
      }
    })
    const context = await browser.newContext()
    const page = await context.newPage()
    page.on('console', msg => { console.log(msg.text()) })
    await page.goto('http://localhost:3000/test/linkTagLoads.html')
    await page.waitForTimeout(5000) // wait for 5 seconds to see if it worked
    const result = await page.evaluate(() => {
      const cssIsDisabled = window.checkIfCssIsDisabled({ justCheck: true })
      return cssIsDisabled
    })
    expect(result).toBe(true)
    await browser.close()
  })

  test('should detect <link> tag doesn\'t load after the JS loads', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/linkTagLoads.html')
    const result = await page.evaluate(() => {
      let eventData
      let tagsPresent
      window.addEventListener('cssDisabled', (event) => {
        eventData = event.detail.message
        if (document.querySelector('style') && document.querySelector('link')) tagsPresent = true
        else tagsPresent = false
      })
      const cssIsDisabled = window.checkIfCssIsDisabled({ justCheck: true })
      setTimeout(() => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'http://localhost:3000/test/nonexistent.css'
        document.head.appendChild(link)
      }, 100)
      return { cssIsDisabled, eventData, tagsPresent }
    })
    await page.waitForTimeout(1000) // wait for the event to be triggered
    expect(result.cssIsDisabled).toBe(false) // initially, css is not disabled
    expect(result.tagsPresent).toBe(true) // it should not remove the style or link tags
    expect(result.eventData).toContain('At least one stylesheet failed to load. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.')
  })

  test('should detect <link> tag doesn\'t load after the JS loads and remove <style> and <link> elements', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/linkTagLoads.html')
    const result = await page.evaluate(() => {
      let eventData
      let tagsPresent
      window.addEventListener('cssDisabled', (event) => {
        eventData = event.detail.message
        if (document.querySelector('style') && document.querySelector('link')) tagsPresent = true
        else tagsPresent = false
      })
      const cssIsDisabled = window.checkIfCssIsDisabled()
      setTimeout(() => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'http://localhost:3000/test/nonexistent.css'
        document.head.appendChild(link)
      }, 100)
      return { cssIsDisabled, eventData, tagsPresent }
    })
    await page.waitForTimeout(1000) // wait for the event to be triggered
    expect(result.cssIsDisabled).toBe(false) // initially, css is not disabled
    expect(result.tagsPresent).toBe(false) // it should not remove the style or link tags
    expect(result.eventData).toContain('At least one stylesheet failed to load. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.')
  })

  test('should detect <link> tag doesn\'t load after the JS loads and remove <style> and <link> elements except the one on the exemption list', async ({ page, browserName }) => {
    await page.goto('http://localhost:3000/test/linkTagLoads.html')
    const result = await page.evaluate(() => {
      let eventData
      let tagsCorrect
      window.addEventListener('cssDisabled', (event) => {
        eventData = event.detail.message
        if (document.querySelector('style') && !document.querySelector('link')) tagsCorrect = true
        else tagsCorrect = false
      })
      const cssIsDisabled = window.checkIfCssIsDisabled({ exemptedIds: ['styletag'] })
      setTimeout(() => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'http://localhost:3000/test/nonexistent.css'
        document.head.appendChild(link)
      }, 100)
      return { cssIsDisabled, eventData, tagsCorrect }
    })
    await page.waitForTimeout(1000) // wait for the event to be triggered
    expect(result.cssIsDisabled).toBe(false) // initially, css is not disabled
    expect(result.tagsCorrect).toBe(true) // it should not remove the style or link tags
    expect(result.eventData).toContain('At least one stylesheet failed to load. It is unsafe to execute any further JavaScript if the CSS has not loaded properly.')
  })
})
