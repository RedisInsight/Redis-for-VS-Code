import { WebElement, WebDriver, until, Locator, By } from 'selenium-webdriver'
import { VSBrowser } from 'vscode-extension-tester'

/**
 * Default wrapper for webelement
 */
export abstract class AbstractElement extends WebElement {
  protected static driver: WebDriver

  /**
   * Constructs a new element from a Locator or an existing WebElement
   * @param base WebDriver compatible Locator for the given element or a reference to an existing WeBelement
   * @param enclosingItem Locator or a WebElement reference to an element containing the element being constructed
   * this will be used to narrow down the search for the underlying DOM element
   */
  constructor(base: Locator | WebElement) {
    if (!AbstractElement.driver) {
      AbstractElement.driver = VSBrowser.instance.driver
    }
    let item: WebElement = AbstractElement.driver.findElement(By.css('html'))

    if (base instanceof WebElement) {
      super(AbstractElement.driver, base.getId())
    } else {
      let toFind = item.findElement(base)
      let id = toFind.getId()
      super(AbstractElement.driver, id)
    }
  }

  /**
   * Wait for the element to become visible
   * @param timeout custom timeout for the wait
   * @returns enable self reference
   */
  async wait(timeout: number = 5000): Promise<this> {
    await this.getDriver().wait(until.elementIsVisible(this), timeout)
    return this
  }
}
