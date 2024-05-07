import { By, Key, VSBrowser, WebDriver } from 'vscode-extension-tester'
import { Locator, until } from 'selenium-webdriver'
import { ButtonActions } from './ButtonActions'

/**
 * Dropdowns
 */
export class DropdownActions {
  static driver: WebDriver
  static initializeDriver(): void {
    if (!DropdownActions.driver) {
      DropdownActions.driver = VSBrowser.instance.driver
    }
  }

  /**
   * Get dropdown value
   * @param locator dropdown locator
   * @param timeout timeout to wait for element
   */
  static async getDropdownValue(
    locator: Locator,
    timeout: number = 3000,
  ): Promise<string> {
    DropdownActions.initializeDriver()
    const dropdown = await DropdownActions.driver.wait(
      until.elementLocated(locator),
      timeout,
    )
    // Get the value attribute or current-value attribute, default to ''
    const value =
      (await dropdown.getAttribute('value')) ||
      (await dropdown.getAttribute('current-value')) ||
      ''

    return value
  }

  /**
   * Get the first top option value in dropdown
   * @param locator dropdown locator
   */
  static async getDropdownTopValue(
    locator: Locator,
  ): Promise<string> {
    DropdownActions.initializeDriver()
    const dropdown = await DropdownActions.driver.wait(
      until.elementLocated(locator),
    )
    const firstOption = await dropdown.findElement(By.xpath('./vscode-option'));

    return await firstOption.getAttribute('value')
  }

  /**
   * Open dropdown which has scrollbar and select value
   * @param dropdownSelector The selector of dropdown
   * @param value The value in dropdown to select
   * @param defaultValue The first top value in dropdown
   */
  static async selectDropdownValueWithScroll(
    dropdownSelector: Locator,
    value: string,
  ): Promise<void> {
    DropdownActions.initializeDriver()
    await ButtonActions.clickElement(dropdownSelector)
    const dropdown = await DropdownActions.driver.wait(
      until.elementLocated(dropdownSelector),
    )
    const defaultValue =
      await DropdownActions.getDropdownTopValue(dropdownSelector)
    let currentValue = await DropdownActions.getDropdownValue(dropdownSelector)

    // Navigate up in the dropdown until top default value selected
    while (currentValue !== defaultValue) {
      await dropdown.sendKeys(Key.ARROW_UP)
      currentValue = await DropdownActions.getDropdownValue(dropdownSelector)
    }

    // Select the specified value
    while (currentValue !== value) {
      await dropdown.sendKeys(Key.ARROW_DOWN)
      currentValue = await DropdownActions.getDropdownValue(dropdownSelector)
    }
    await ButtonActions.clickElement(
      By.xpath(`//vscode-option[contains(@value, "${value}")]`),
    )
  }
}
