import { WebElement, WebDriver, until, Locator, By } from 'selenium-webdriver'
import { ISize, VSBrowser } from 'vscode-extension-tester'

/**
 * Default wrapper for webelement
 */
export class BaseComponent extends WebElement {
  protected static driver: WebDriver

  /**
   * Constructs a new element from a Locator or an existing WebElement
   * @param base WebDriver compatible Locator for the given element or a reference to an existing WeBelement
   * this will be used to narrow down the search for the underlying DOM element
   */
  constructor(base: Locator | WebElement) {
    if (!BaseComponent.driver) {
      BaseComponent.driver = VSBrowser.instance.driver
    }
    let item: WebElement = BaseComponent.driver.findElement(By.css('html'))

    if (base instanceof WebElement) {
      super(BaseComponent.driver, base.getId())
    } else {
      let toFind = item.findElement(base)
      let id = toFind.getId()
      super(BaseComponent.driver, id)
    }
  }

  /**
   * Wait for the element to become visible
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns Self reference
   */
  async wait(timeout: number = 5000): Promise<this> {
    await this.getDriver().wait(until.elementIsVisible(this), timeout)
    return this
  }

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
    return this.getDriver().wait(until.elementLocated(locator), timeout)
  }

  /**
   * Wait for the elements to be found by locator and return them
   * @param locator Webdriver locator to search by
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns WebElements
   */
  async getElements(
    locator: Locator,
    timeout: number = 5000,
  ): Promise<WebElement[]> {
    return this.getDriver().wait(until.elementsLocated(locator), timeout)
  }

  /**
   * Is the element displayed
   * @param locator locator to check
   */
  async isElementDisplayed(locator: Locator): Promise<boolean> {
    try {
      const elements = await this.getDriver().findElements(locator)
      if (elements.length > 0) {
        return await elements[0].isDisplayed()
      } else {
        return false
      }
    } catch (error) {
      return false
    }
  }

  /**
   * Is the element disabled
   * @param locator locator to check
   * @param attribute attribute to check if has disabled
   */
  async isElementDisabled(
    locator: Locator,
    attribute: string,
  ): Promise<boolean> {
    const element: WebElement = await this.getDriver().findElement(locator)
    const isEnabled: boolean = await element.isEnabled()

    if (isEnabled) {
      const value: string | null = await element.getAttribute(attribute)
      return value ? value.includes('disabled') : false
    } else {
      // If the element is not enabled, it's considered disabled
      return true
    }
  }

  /**
   * Get text from element
   * @param locator locator to check
   * @returns Promise resolving to element text
   */
  async getElementText(locator: Locator): Promise<string> {
    return await (await this.getElement(locator)).getText()
  }

  /**
   * Wait for the element to be visible and return it
   * @param locator Webdriver locator to search by
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns WebElement
   */
  async waitElementToBeVisible(
    locator: Locator,
    timeout: number = 5000,
  ): Promise<WebElement> {
    const element = await this.getDriver().wait(
      until.elementLocated(locator),
      timeout,
    )
    return await this.getDriver().wait(until.elementIsVisible(element), timeout)
  }

  /**
   * Wait for the element to be not visible
   * @param locator Webdriver locator to search by
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @returns WebElement
   */
  async waitUntilElementNotDisplayed(
    locator: Locator,
    timeout: number,
  ): Promise<boolean> {
    const endTime = Date.now() + timeout
    while (Date.now() < endTime) {
      try {
        const elements: WebElement[] =
          await this.getDriver().findElements(locator)
        if (elements.length === 0) {
          // Element not found, consider it not displayed
          return true
        }
        // Check if the first element is not displayed
        const isNotDisplayed = !(await elements[0].isDisplayed())
        if (isNotDisplayed) {
          return true
        }
      } catch (error) {
        // ignore stale element errors
      }
      // Wait for a short interval before re-checking
      await this.getDriver().sleep(500)
    }
    // Timeout reached, element may still be displayed
    return false
  }
}
