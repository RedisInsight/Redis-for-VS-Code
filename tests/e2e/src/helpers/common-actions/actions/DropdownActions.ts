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
   * Open dropdown and select value
   * @param dropdownSelector The selector of dropdown
   * @param value The value in dropdown to select
   * @param defaultValue The first top value in dropdown
   */
  static async selectDropdownValue(
    dropdownSelector: Locator,
    value: string,
    defaultValue: string,
  ): Promise<void> {
    DropdownActions.initializeDriver()
    await ButtonActions.clickElement(dropdownSelector)
    const dropdown = await DropdownActions.driver.wait(
      until.elementLocated(dropdownSelector),
    )
    let currentValue = await DropdownActions.getDropdownValue(dropdownSelector)

    // Navigate up in the dropdown until top default value selected
    while (currentValue !== defaultValue) {
      await dropdown.sendKeys(Key.ARROW_UP)
      currentValue = await DropdownActions.getDropdownValue(dropdownSelector)
    }

    // Select the specified formatter
    while (currentValue !== value) {
      await dropdown.sendKeys(Key.ARROW_DOWN)
      currentValue = await DropdownActions.getDropdownValue(dropdownSelector)
    }
    await ButtonActions.clickElement(
      By.xpath(`//vscode-option[contains(@value, "${value}")]`),
    )
  }
}
