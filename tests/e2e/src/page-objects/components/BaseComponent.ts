import { WebElement, WebDriver, until, Locator, By } from 'selenium-webdriver'
import { VSBrowser } from 'vscode-extension-tester'

/**
 * Default wrapper for webelement
 */
export class BaseComponent extends WebElement {
  static driver: WebDriver

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
    return await this.getDriver().wait(until.elementLocated(locator), timeout)
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
    const elements = await this.getDriver().wait(until.elementsLocated(locator), timeout);
     // Ensure elements is always an array
     if (Array.isArray(elements)) {
      return elements;
    } else {
      return [elements];
    }
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
   * @returns true if element disabled
   */
  async isElementDisabled(
    locator: Locator,
    attribute: string,
  ): Promise<boolean> {
    const element = await this.getElement(locator)
    const isEnabled = await element.isEnabled()
    const value = await element.getAttribute(attribute)
    return value.includes('disabled') || !isEnabled
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
   * Wait for the element to be visible or not visible
   * @param locator Webdriver locator to search by
   * @param timeout Optional maximum time to wait for completion in milliseconds, 0 for unlimited
   * @param stateOfDisplayed state of wait (Visible or not Visible)
   * @returns Boolean
   */
  async waitForElementVisibility(
    locator: Locator,
    timeout: number = 5000,
    stateOfDisplayed: boolean = true,
  ): Promise<boolean> {
    let element: WebElement
    if (stateOfDisplayed) {
      try {
        element = await this.getDriver().wait(until.elementLocated(locator), timeout)
        await this.getDriver().wait(until.elementIsVisible(element), timeout)
        return true
      } catch (e) {
        // Element not visible during timeout
        return false
      }
    } else {
      try {
        let element = await this.getDriver().wait(
          until.elementLocated(locator),
          timeout,
        )
        const isVisible = await element.isDisplayed()
        if (isVisible) {
          await this.getDriver().wait(
            until.elementIsNotVisible(element),
            timeout,
          )
        }
        return true
      } catch (e) {
        // Return true, if element not found and not visible
        return true
      }
    }
  }
}
