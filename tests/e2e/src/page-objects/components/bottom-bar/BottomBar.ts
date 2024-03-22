import { By } from 'selenium-webdriver'
import {
  Workbench,
  BottomBarPanel,
  Locator,
  WebElement,
  until,
} from 'vscode-extension-tester'
import { CliViewPanel } from './CliViewPanel'

/**
 * VSCode bottom bar
 */
export class BottomBar extends BottomBarPanel {
  tabContainer = By.className('composite title has-composite-bar')
  actions = By.className('title-actions')
  globalActions = By.className('title-actions')
  closeAction = By.className('codicon-panel-close')
  action = (label: string) => By.xpath(`.//a[starts-with(@title, '${label}')]`)
  tab = (title: string) => By.xpath(`.//li[starts-with(@title, '${title}')]`)
  label = (title: string) =>
    By.xpath(`.//a[starts-with(@aria-label, '${title}')]`)

  /**
   * Wait for the element to be found by locator and return it
   * @param locator Webdriver locator to search by
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns WebElement
   */
  async getElement(
    locator: Locator,
    timeout: number = 5000,
  ): Promise<WebElement> {
    return await this.getDriver().wait(until.elementLocated(locator), timeout)
  }

  /**
   * Open the CLI view in the bottom panel
   * @returns Promise resolving to CliView object
   */
  async openCliViewPanel(): Promise<CliViewPanel> {
    await this.openBottomTab('Redis CLI')
    return new CliViewPanel().wait()
  }

  /**
   * Open the Tab by name in the bottom panel
   * @param title The title of tab
   * @returns Promise resolving when tab opened
   */
  async openBottomTab(title: string): Promise<void> {
    await this.toggle(true)
    const tabContainer = await this.getElement(this.tabContainer)
    try {
      const tabs = await tabContainer.findElements(this.tab(title))
      if (tabs.length > 0) {
        await tabs[0].click()
      } else {
        const label = await tabContainer.findElement(this.label(title))
        await label.click()
      }
    } catch (err) {
      await new Workbench().executeCommand(`${title}: Focus on ${title} View`)
    }
  }
}
