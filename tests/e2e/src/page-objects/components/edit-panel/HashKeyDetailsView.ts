import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/edit-panel/DoubleColumnKeyDetailsView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'

/**
 * Hash Key details view
 */
export class HashKeyDetailsView extends DoubleColumnKeyDetailsView {
  hashFieldValueEditor = By.xpath(`//*[@data-testid = 'hash-value-editor']`)
  hashFieldsList = By.xpath(
    `//*[contains(@data-testid, 'hash-field-') and not(contains(@data-testid,'value'))]/div`,
  )
  hashValuesList = By.xpath(
    `//*[contains(@data-testid, 'hash-field-value-')]/div`,
  )
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'hash-field-value-')]//*[@class = 'truncate']`,
  )
  addKeyValueItemsButton = By.xpath(
    `//*[@data-testid = 'add-key-value-items-btn']`,
  )
  addHashFieldPanel = By.xpath(`//*[@data-testid = 'add-hash-field-panel']`)
  hashFieldInput = By.xpath(
    `//*[@data-testid = 'add-hash-field-panel']//*[contains(@data-testid, 'hash-field-')]`,
  )
  hashValueInput = By.xpath(
    `//*[@data-testid = 'add-hash-field-panel']//*[contains(@data-testid, 'hash-value-')]`,
  )
  saveHashFieldButton = By.xpath(`//*[@data-testid = 'save-fields-btn']`)

  /**
   * Edit Hash key value from details
   * @param value The value of the key
   * @param name The field value
   */
  async editHashKeyValue(value: string, name: string): Promise<void> {
    await super.editKeyValue(
      value,
      name,
      this.hashFieldValueEditor,
      KeyTypesShort.Hash,
    )
  }

  /**
   * Add field to hash key
   * @param keyFieldValue The value of the hash field
   * @param keyValue The hash value
   */
  async addFieldToHash(keyFieldValue: string, keyValue: string): Promise<void> {
    await (await this.getElement(this.addKeyValueItemsButton)).click()
    const fieldInput = await this.getElement(this.hashFieldInput)
    const valueInput = await this.getElement(this.hashValueInput)
    await fieldInput.sendKeys(keyFieldValue)
    await valueInput.sendKeys(keyValue)
    await (await this.getElement(this.saveHashFieldButton)).click()
  }
}
