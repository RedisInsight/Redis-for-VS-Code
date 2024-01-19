import { By, Locator } from 'selenium-webdriver'
import { BaseComponent } from '../BaseComponent'
import { ViewLocators, Views } from '@e2eSrc/page-objects/components/WebView'
import { ButtonsActions } from '@e2eSrc/helpers/common-actions'

/**
 * key tree list view
 */
export class KeyTreeView extends BaseComponent {
  treeViewPage = By.xpath(`//div[@data-testid='tree-view-page']`)
  scanMoreBtn = By.xpath(`//vscode-button[@data-testid='scan-more']`)
  treeViewKey = By.xpath(
    `//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')]`,
  )
  keyStarts = By.xpath(`//div[starts-with(@data-testid, 'key-')]`)
  refreshButton = By.xpath(`//vscode-button[@data-testid = 'refresh-keys']`)
  addKeyButton = By.xpath(`//vscode-button[@data-testid = 'add-key-button']`)
  sortKeysBtn = By.xpath(`//vscode-button[@data-testid = 'sort-keys']`)
  // mask
  keyMask = '//*[@data-testid="key-$name"]'
  deleteKeyInListBtn = By.xpath(
    `//vscode-button[starts-with(@data-testid, 'remove-key-')]`,
  )
  submitDeleteKeyButton = By.xpath(
    `//div[@class='popup-content ']${this.deleteKeyInListBtn}`,
  )

  getTreeViewItemByIndex = (index: number) =>
    By.xpath(
      `(//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')])[${index}]`,
    )
  getKey = (base: string) =>
    By.xpath(`//div[starts-with(@data-testid, '${base}')]`)

  getFolderSelectorByName = (folderName: string): Locator => {
    return By.xpath(
      `//div[starts-with(@data-testid, 'node-item_${folderName}')]`,
    )
  }

  getFolderNameSelectorByNameAndIndex = (
    folderName: string,
    index: number,
  ): Locator => {
    return By.xpath(
      `(//div[starts-with(@data-testid, 'node-item_${folderName}')])[${index}]//*[starts-with(@data-testid, 'folder-')]`,
    )
  }

  constructor() {
    super(By.xpath(ViewLocators[Views.KeyTreeView]))
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
   * Check whether Element is expanded
   * @param baseSelector the base element selector
   * * @returns Promise resolving to true if element is expanded
   */
  async verifyElementExpanded(baseSelector: Locator): Promise<boolean> {
    const elementSelector = await (
      await this.getElement(baseSelector)
    ).getAttribute('data-testid')
    return elementSelector?.includes('expanded')
  }

  /**
   * Click on the folder element if it is not expanded
   * @param base the base element
   */
  private async clickElementIfNotExpanded(base: string): Promise<void> {
    const baseSelector = this.getKey(base)
    if (!(await this.verifyElementExpanded(baseSelector))) {
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

  /**
   * Delete first Key in list after Hovering
   */
  async deleteFirstKeyFromList(): Promise<void> {
    await ButtonsActions.hoverElement(this.treeViewKey)
    await (await this.getElement(this.deleteKeyInListBtn)).click()
    await (await this.getElement(this.submitDeleteKeyButton)).click()
  }

  /**
  * Delete first Key in list after Hovering
  */
  async deleteKeyFromList(keyName: string): Promise<void> {
    const itemDeleteButton = By.xpath(
      `//vscode-button[starts-with(@data-testid, 'remove-key-${keyName}')]`,
    )
    await ButtonsActions.hoverElement(this.treeViewKey)
    await (await this.getElement(itemDeleteButton)).click()
    await (await this.getElement(this.submitDeleteKeyButton)).click()
  }
}
