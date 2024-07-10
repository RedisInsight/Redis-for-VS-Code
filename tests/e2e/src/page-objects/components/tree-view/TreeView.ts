import { By, Locator } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'
import {
  ButtonActions,
  DropdownActions,
  InputActions,
} from '@e2eSrc/helpers/common-actions'
import { Config } from '@e2eSrc/helpers'

/**
 * Tree list view with databases and keys
 */
export class TreeView extends WebView {
  treeViewPage = By.xpath(`//div[@data-testid='tree-view-page']`)
  scanMoreBtn = By.xpath(`//vscode-button[@data-testid='scan-more']`)
  totalKeyNumber = By.xpath(`//span[@data-testid='keys-total']`)
  treeViewKey = By.xpath(
    `//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')]`,
  )
  keyStarts = By.xpath(`//div[starts-with(@data-testid, 'key-')]`)
  refreshButton = By.xpath(`//vscode-button[@data-testid='refresh-keys']`)
  addKeyButton = By.xpath(`//vscode-button[@data-testid='add-key-button']`)
  sortKeysBtn = By.xpath(`//vscode-button[@data-testid='sort-keys']`)
  addDatabaseBtn = By.xpath(`//a[@aria-label='Add Redis database']`)
  editDatabaseBtn = By.xpath(`//vscode-button[@data-testid='edit-database']`)
  settingsButton = By.xpath(`//a[@aria-label='Open Redis Insight settings']`)
  deleteKeyInListBtn = By.xpath(
    `//vscode-button[starts-with(@data-testid, 'remove-key-')]`,
  )
  submitDeleteKeyButton = By.xpath(
    `//div[@class='popup-content ']//vscode-button[starts-with(@data-testid, 'remove-key-')]`,
  )
  keyTreeFilterTrigger = By.xpath(
    `//vscode-button[@data-testid='key-tree-filter-trigger']`,
  )
  treeViewSearchInput = By.xpath(
    `//input[@data-testid='tree-view-search-input']`,
  )
  keyTreeFilterApplyBtn = By.xpath(
    `//vscode-button[@data-testid='key-tree-filter-apply-btn']`,
  )
  keyTreeFilterCancelBtn = By.xpath(
    `//vscode-button[@data-testid='key-tree-filter-cancel-btn']`,
  )
  loadingIndicator = By.xpath(`//*[contains(@class, "table-loading")]`)
  treeViewFilterSelect = By.xpath(
    `//vscode-dropdown[@data-testid='tree-view-filter-select']`,
  )
  keyTreeFilterClearBtn = By.xpath(
    `//vscode-button[@data-testid='key-tree-filter-clear-btn']`,
  )
  keysSummary = By.xpath(`//*[@data-testid='keys-summary']`)
  treeViewVirtualTable = By.xpath(`//*[@data-testid='virtual-tree']/div`)
  databaseInstance = By.xpath(`//div[starts-with(@data-testid, 'database-')]`)

  // mask
  keyMask = '//*[@data-testid="key-$name"]'
  getItemDeleteButton = (keyName: string): Locator =>
    By.xpath(
      `//vscode-button[starts-with(@data-testid, 'remove-key-${keyName}')]`,
    )
  getTreeViewItemByIndex = (index: number): Locator =>
    By.xpath(
      `(//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')])[${index}]`,
    )
  getTreeViewItemByName = (name: string): Locator =>
    By.xpath(
      `(//div[@role='treeitem']//div[starts-with(@data-testid, 'key-${name}')])`,
    )
  getKey = (base: string): Locator =>
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
  getDatabaseByName = (name: string): Locator =>
    By.xpath(
      `.//div[starts-with(@data-testid, 'database-')][.//*[text()='${name}']]/div`,
    )
  getEditDatabaseBtnByName = (name: string): Locator =>
    By.xpath(
      `.//div[starts-with(@data-testid, 'database-')][.//*[text()='${name}']]/..//vscode-button[@data-testid='edit-database']`,
    )
  getRefreshDatabaseBtnByName = (name: string): Locator =>
    By.xpath(
      `.//div[starts-with(@data-testid, 'database-')][.//*[text()='${name}']]/..//vscode-button[@data-testid = 'refresh-keys']`,
    )
  getCLIDatabaseBtnByName = (name: string): Locator =>
    By.xpath(
      `.//div[starts-with(@data-testid, 'database-')][.//*[text()='${name}']]/..//vscode-button[@data-testid = 'terminal-button']`,
    )
  getKeySelectorByName = (name: string): Locator =>
    By.xpath(`//*[@data-testid="key-${name}"]`)
  getNotPatternedKeyByName = (name: string): Locator =>
    By.xpath(
      `//div[starts-with(@data-testid, 'node-item_${name}') and .//div[starts-with(@data-testid, 'key-')]]`,
    )
  getLimitedTreeViewKeys = (number: number): Locator =>
    By.xpath(
      `(//div[@role='treeitem']//div[starts-with(@data-testid, 'key-')])[position() <= ${number}]`,
    )

  /**
   * Open key details of the key by name
   * @param keyName The name of the key
   */
  async openKeyDetailsByKeyName(name: string): Promise<void> {
    await ButtonActions.clickElement(this.getKeySelectorByName(name))
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
      await super.getElement(baseSelector)
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
      await ButtonActions.clickElement(baseSelector)
    }
  }

  /**
   * Get all keys from tree view list with order
   */
  async getAllKeysArray(): Promise<string[]> {
    const textArray: string[] = []
    const itemCount = (await super.getElements(this.treeViewKey)).length

    for (let i = 1; i <= itemCount; i++) {
      const treeItemElementText = await super.getElementText(
        this.getTreeViewItemByIndex(i),
      )

      textArray.push(treeItemElementText)
    }
    return textArray
  }

  /**
   * Delete first Key in list after Hovering
   */
  async deleteFirstKeyFromList(): Promise<void> {
    await ButtonActions.hoverElement(this.treeViewKey)
    await ButtonActions.clickElement(this.deleteKeyInListBtn)
    await ButtonActions.clickElement(this.submitDeleteKeyButton)
    await this.waitForElementVisibility(this.loadingIndicator, 1000, false)
  }

  /**
   * Delete first Key in list after Hovering
   */
  async deleteKeyFromListByName(keyName: string): Promise<void> {
    await ButtonActions.hoverElement(this.getTreeViewItemByName(keyName))
    await ButtonActions.clickElement(this.getItemDeleteButton(keyName))
    await ButtonActions.clickElement(this.submitDeleteKeyButton)
  }

  /**
   * Click on database in list by name to expand or collapse it
   * @param databaseName The name of the database
   */
  async clickDatabaseByName(databaseName: string): Promise<void> {
    await ButtonActions.clickElement(this.getDatabaseByName(databaseName))
  }

  /**
   * Click on edit database in list by its name
   * @param databaseName The name of the database
   */
  async editDatabaseByName(databaseName: string): Promise<void> {
    await ButtonActions.clickElement(
      this.getEditDatabaseBtnByName(databaseName),
    )
  }

  /**
   * Click on refresh database in list by its name
   * @param databaseName The name of the database
   */
  async refreshDatabaseByName(databaseName: string): Promise<void> {
    await ButtonActions.clickElement(
      this.getRefreshDatabaseBtnByName(databaseName),
    )
    // Hover to CLI btn to not display refresh popover
    await ButtonActions.hoverElement(this.getCLIDatabaseBtnByName(databaseName))
    await this.waitForElementVisibility(this.loadingIndicator, 1000, true)
    await this.waitForElementVisibility(this.loadingIndicator, 1000, false)
  }

  /**
   * Verifying if the Key is in the List of keys
   * @param keyName The name of the key
   */
  async isKeyIsDisplayedInTheList(keyName: string): Promise<boolean> {
    const keyNameInTheList = this.getKeySelectorByName(keyName)
    return await super.isElementDisplayed(keyNameInTheList)
  }

  /**
   * Searching by Key name in the list
   * @param keyName The name of the key
   */
  async searchByKeyName(keyName: string): Promise<void> {
    await this.waitForElementVisibility(this.loadingIndicator, 1000, false)
    await ButtonActions.clickElement(this.keyTreeFilterTrigger)
    await InputActions.typeText(this.treeViewSearchInput, keyName)
    await ButtonActions.clickElement(this.keyTreeFilterApplyBtn)
    await this.waitForElementVisibility(this.loadingIndicator, 1000, false)
  }

  /**
   * Select keys filter group type
   * @param value The value to select
   */
  async selectFilterGroupType(value: string): Promise<void> {
    if (!(await this.isElementDisplayed(this.treeViewFilterSelect))) {
      await ButtonActions.clickElement(this.keyTreeFilterTrigger)
    }
    await DropdownActions.selectDropdownValueWithScroll(
      this.treeViewFilterSelect,
      value,
    )
    await ButtonActions.clickElement(this.keyTreeFilterApplyBtn)
    await this.waitForElementVisibility(this.loadingIndicator, 1000, false)
  }

  /**
   * Clear keys filter
   */
  async clearFilter(): Promise<void> {
    if (!(await this.isElementDisplayed(this.treeViewFilterSelect))) {
      await ButtonActions.clickElement(this.keyTreeFilterTrigger)
    }
    await ButtonActions.clickElement(this.keyTreeFilterClearBtn)
  }

  /**
   * Get scanned results from scan more
   */
  async getScannedResults(): Promise<number> {
    let treeView = new TreeView()
    await this.waitForElementVisibility(this.loadingIndicator, 1000, false)
    const text = await treeView.getElementText(treeView.scanMoreBtn)
    const match: any = text.match(/\((\d{1,3}(?: \d{3})*) Scanned\)/)

    // Extract the matched number part
    const scannedResults = Number(match[1].replace(/\s/g, ''))

    return scannedResults
  }

  /**
   * Click on CLI database in list by its name
   * @param databaseName The name of the database
   */
  async openCliByDatabaseName(databaseName: string): Promise<void> {
    await ButtonActions.clickElement(this.getCLIDatabaseBtnByName(databaseName))
    // TODO delete after fixing CLI issue with invalid db id
    await ButtonActions.clickElement(this.getCLIDatabaseBtnByName(databaseName))
  }
}
