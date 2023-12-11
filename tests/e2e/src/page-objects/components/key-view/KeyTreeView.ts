import { By } from 'selenium-webdriver'
import { BaseComponent } from '../BaseComponent'

/**
 * key tree list view
 */
export class KeyTreeView extends BaseComponent {
  // frame locator
  static treeFrame =
    By.xpath(`(//div[@data-keybinding-context and not(@class)]/iframe[@class='webview ready' and not(@data-parent-flow-to-element-id)])
`)
  treeViewPage = By.xpath(`//div[@data-testid='tree-view-page']`)
  scanMoreBtn = By.xpath(`//vscode-button[@data-testid='scan-more']`)
  treeViewKey = By.xpath(
    `//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')]`,
  )
  keyStarts = By.xpath(`//div[starts-with(@data-testid, 'key-')]`)
  // mask
  keyMask = '//*[@data-testid="key-$name"]'

  getTreeViewItemByIndex = (index: number) =>
    By.xpath(
      `(//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')])[${index}]`,
    )
  getKey = (base: string) =>
    By.xpath(`//div[starts-with(@data-testid, '${base}')]`)

  constructor() {
    super(KeyTreeView.treeFrame)
  }

  /**
   * Open key details of the key by name
   * @param keyName The name of the key
   */
  async openKeyDetailsByKeyName(name: string): Promise<void> {
    const keyNameInTheListLocator = By.xpath(
      this.keyMask.replace(/\$name/g, name),
    )
    const keyNameInTheListElement = await this.getElement(
      keyNameInTheListLocator,
    )
    await keyNameInTheListElement.click()
  }

  /**
   * Get tree view panel text
   * @returns Promise resolving to tree view panel text
   */
  async getTreeViewText(): Promise<string> {
    return await (await this.getElement(this.treeViewPage)).getText()
  }

  /**
   * Open tree folder with multiple level
   * @param names folder names with sequence of subfolder
   */
  async openTreeFolders(names: string[]): Promise<void> {
    let base = `node-item_${names[0]}:`
    await this.clickElementIfNotExpanded(base)
    if (names.length > 1) {
      for (let i = 1; i < names.length; i++) {
        base = `${base}${names[i]}:`
        await this.clickElementIfNotExpanded(base)
      }
    }
  }

  /**
   * Click on the folder element if it is not expanded
   * @param base the base element
   */
  private async clickElementIfNotExpanded(base: string): Promise<void> {
    const baseSelector = this.getKey(base)
    const elementSelector = await (
      await this.getElement(baseSelector)
    ).getAttribute('data-testid')
    if (!elementSelector?.includes('expanded')) {
      await (await this.getElement(baseSelector)).click()
    }
  }

  /**
   * Get all keys from tree view list with order
   */
  async getAllKeysArray(): Promise<string[]> {
    const textArray: string[] = []
    const treeViewItemElements = this.treeViewKey
    const itemCount = (
      await this.getDriver().findElements(treeViewItemElements)
    ).length

    for (let i = 1; i <= itemCount; i++) {
      const treeItemElement = await this.getDriver().findElement(
        this.getTreeViewItemByIndex(i),
      )
      textArray.push(await treeItemElement.getText())
    }

    return textArray
  }
}
