import { By } from 'selenium-webdriver'
import { Workbench, BottomBarPanel } from 'vscode-extension-tester'
import { CliView } from './CliView'
import { AbstractElement } from '../AbstractElement'

export class BottomBar extends AbstractElement {
  constructor() {
    super(By.id('workbench.parts.panel'))
  }
  tabContainer = By.className('composite title has-composite-bar')
  actions = By.className('title-actions')
  globalActions = By.className('title-actions')
  closeAction = By.className('codicon-panel-close')
  action = (label: string) => By.xpath(`.//a[starts-with(@title, '${label}')]`)
  tab = (title: string) => By.xpath(`.//li[starts-with(@title, '${title}')]`)
  label = (title: string) =>
    By.xpath(`.//a[starts-with(@aria-label, '${title}')]`)

  /**
   * Open the CLI view in the bottom panel
   * @returns Promise resolving to CliView object
   */
  async openCliView(): Promise<CliView> {
    await this.openTab('RedisInsight CLI')
    return new CliView(this).wait()
  }

  /**
   * Open the Tab by name in the bottom panel
   * @param title The title of tab
   * @returns Promise resolving when tab opened
   */
  async openTab(title: string): Promise<void> {
    await new BottomBarPanel().toggle(true)
    console.log('before finding element')
    const tabContainer = await this.findElement(this.tabContainer)
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
