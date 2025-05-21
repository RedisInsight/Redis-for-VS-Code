import { openRedisView } from '../helpers/navigation'
import { expect } from 'chai'
import {
  By,
  EditorView,
  until,
  WebDriver,
  WebElement,
  WebView,
} from 'vscode-extension-tester'

const EULA_TAB_TITLE = 'Redis for VS Code - EULA'
const WELCOME_TAB_TITLE = 'Redis for VS Code - Welcome'

const getWebViewFromTab = async (tabTitle: string): Promise<WebView> => {
  const editorView = new EditorView()

  const activeEditor = await editorView.openEditor(tabTitle)

  if (!(activeEditor instanceof WebView)) {
    throw new Error('Expected a WebView, but got a different editor type')
  }

  return activeEditor
}

export async function getLink(
  driver: WebDriver,
  title: string,
): Promise<string> {
  const anchors = await driver.findElements(By.css('a'))
  for (const anchor of anchors) {
    const text = (await anchor.getText()).trim()
    if (text.includes(title)) {
      return await anchor.getAttribute('href')
    }
  }
  throw new Error(`Link with title "${title}" not found`)
}

const getSubmitButton = async (driver: WebDriver): Promise<WebElement> =>
  driver.findElement(By.css('[data-testid="btn-submit"]'))

describe('EULA', () => {
  before(async () => {
    await openRedisView()
    await new Promise(r => setTimeout(r, 1000))
  })

  it('render EULA page elements', async () => {
    const eulaWebView = await getWebViewFromTab(EULA_TAB_TITLE)
    const driver = eulaWebView.getDriver()
    await eulaWebView.switchToFrame()

    const bodyElement = await driver.wait(
      until.elementLocated(By.css('body')),
      10000,
      'Timeout: body not found in EULA WebView',
    )

    const rawText = await bodyElement.getText()

    // Page title
    expect(rawText).to.include('EULA and Privacy settings')

    // Checkboxes
    expect(rawText).to.include('Use recommended settings')
    expect(rawText).to.include('Usage Data')
    expect(rawText).to.include('Encrypt sensitive information')
    expect(rawText).to.include('I have read and understood the Terms')

    // Sections
    expect(rawText).to.include('Privacy Settings')

    // Buttons
    expect(rawText).to.include('Submit')

    // Links
    const serverSidePublicLicense = await getLink(
      driver,
      'Server Side Public License',
    )
    expect(serverSidePublicLicense).to.equal(
      'https://github.com/RedisInsight/Redis-for-VS-Code/blob/main/LICENSE',
    )

    eulaWebView.switchBack()
  })

  it('should enable Submit button when terms are accepted', async () => {
    const eulaWebView = await getWebViewFromTab(EULA_TAB_TITLE)
    await eulaWebView.switchToFrame()

    const driver = eulaWebView.getDriver()

    // Disabled by default
    expect(
      await (await getSubmitButton(driver)).getAttribute('disabled'),
    ).to.eq('true')

    // Recommended settings
    const useRecommendedSettings = await driver.findElement(
      By.xpath("//label[contains(., 'Use recommended settings')]"),
    )
    await useRecommendedSettings.click()
    expect(
      await (await getSubmitButton(driver)).getAttribute('disabled'),
    ).to.eq('true')

    // Terms and conditions
    const acceptTermsCheckbox = await driver.findElement(
      By.xpath("//label[contains(., 'I have read and understood the Terms')]"),
    )
    await acceptTermsCheckbox.click()
    expect(await (await getSubmitButton(driver)).getAttribute('disabled')).to.be
      .null

    eulaWebView.switchBack()
  })

  it('should hide EULA and display other extension controls', async () => {
    const eulaWebView = await getWebViewFromTab(EULA_TAB_TITLE)
    await eulaWebView.switchToFrame()

    const driver = eulaWebView.getDriver()

    const acceptTermsCheckbox = await driver.findElement(
      By.xpath("//label[contains(., 'I have read and understood the Terms')]"),
    )
    await acceptTermsCheckbox.click()
    const submitButton = await getSubmitButton(driver)
    await submitButton.click()

    await eulaWebView.switchBack()

    await new Promise(r => setTimeout(r, 5000)) // wait for the EULA to close

    const welcomeView = await getWebViewFromTab(WELCOME_TAB_TITLE)
    await welcomeView.switchToFrame()
    const rawText = await (
      await eulaWebView.findWebElement(By.css('body'))
    ).getText()

    expect(rawText).to.include('Start')
    expect(rawText).to.include('Create new database')

    // TODO: add asserts for the side bar items

    await welcomeView.switchBack()
  })
})
