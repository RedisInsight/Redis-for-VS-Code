import { By } from 'selenium-webdriver'
import { BaseComponent } from '../BaseComponent'

/**
 * Key details view
 */
export class KeyDetailsView extends BaseComponent {
  // frame locator
  static keyFrame = By.xpath(
    `//div[contains(@data-parent-flow-to-element-id, 'webview-editor-element')]/iframe`,
  )

  // key details locators
  ttlField = By.xpath(`//*[@data-testid='inline-item-editor']`)
  saveTtl = By.xpath(`//*[@data-testid='apply-btn']`)
  keyType = By.xpath(`//div[contains(@class, '_keyFlexGroup')]`)
  keyName = By.xpath(`//div[@data-testid='key-name-text']/b`)
  keySize = By.xpath(`//div[@data-testid='key-size-text']`)
  keyLength = By.xpath(`//div[@data-testid='key-length-text']`)
  keyRefresh = By.xpath(`//div[@data-testid='refresh-key-btn']`)

  constructor() {
    super(KeyDetailsView.keyFrame)
  }

  /**
   * get key size
   */
  async getKeySize(): Promise<number> {
    const keySizeText = await this.getElementText(this.keySize)
    const regex = /Key Size: (\d+)/
    const match = keySizeText.match(regex)
    return match ? parseInt(match[1], 10) : NaN
  }

  /**
   * get key length
   */
  async getKeyLength(): Promise<number> {
    const keyLengthText = await this.getElementText(this.keyLength)
    const regex = /Length: (\d+)/
    const match = keyLengthText.match(regex)
    return match ? parseInt(match[1], 10) : NaN
  }

  /**
   * get ttl value
   */
  async getKeyTtl(): Promise<string> {
    const keySizeText = await this.getElement(this.ttlField)
    return await keySizeText.getAttribute('value')
  }
}
