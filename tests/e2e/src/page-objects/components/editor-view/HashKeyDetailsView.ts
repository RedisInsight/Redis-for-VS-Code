import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/editor-view/DoubleColumnKeyDetailsView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { CommonDriverExtension } from '@e2eSrc/helpers'
import { Key } from 'vscode-extension-tester'

/**
 * Hash Key details view
 */
export class HashKeyDetailsView extends DoubleColumnKeyDetailsView {
  hashFieldValueEditor = By.xpath(
    `//*[contains(@data-testid, 'hash_value-editor')]`,
  )
  hashFieldTtlEditor = By.xpath(`//*[@data-testid = 'inline-item-editor']`)
  hashFieldsList = By.xpath(
    `//*[contains(@data-testid, 'hash-field-') and not(contains(@data-testid,'value'))]/div`,
  )
  hashValuesList = By.xpath(
    `//*[contains(@data-testid, 'hash_content-value-')]`,
  )
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'hash_content-value-')]//*[@class = 'truncate']`,
  )
  addHashFieldPanel = By.xpath(`//*[@data-testid = 'add-hash-field-panel']`)
  hashFieldInput = By.xpath(
    `//*[@data-testid = 'add-hash-field-panel']//*[contains(@data-testid, 'hash-field-')]`,
  )
  hashValueInput = By.xpath(
    `//*[@data-testid = 'add-hash-field-panel']//*[contains(@data-testid, 'hash-value-')]`,
  )
  saveHashFieldButton = By.xpath(`//*[@data-testid = 'save-fields-btn']`)
  showTtlCheckbox = By.xpath(
    `//*[@data-testid = 'show-ttl-column-checkbox']/parent::*/parent::*`,
  )

  getFieldTtlInputByField = (field: string): By =>
    By.xpath(`//div[@data-testid="hash-ttl_content-value-${field}"]`)

  getEditFieldByField = (field: string): By =>
    By.xpath(`//*[@data-testid="hash-ttl_edit-btn-${field}"]`)

  /**
   * Edit Hash key value from details
   * @param value The value of the key
   * @param name The field value
   */
  async editHashKeyValue(value: string, name: string = ''): Promise<void> {
    await super.editKeyValue(
      value,
      name,
      this.hashFieldValueEditor,
      KeyTypesShort.Hash,
    )
    // Wait until value changes
    await CommonDriverExtension.driverSleep(300)
  }

  /**
   * Add field to hash key
   * @param keyFieldValue The value of the hash field
   * @param keyValue The hash value
   */
  async addFieldToHash(keyFieldValue: string, keyValue: string): Promise<void> {
    await ButtonActions.clickElement(this.addKeyValueItemsButton)
    await InputActions.typeText(this.hashFieldInput, keyFieldValue)
    await InputActions.typeText(this.hashValueInput, keyValue)
    await ButtonActions.clickElement(this.saveHashFieldButton)
  }

  /**
   * Edit Hash field ttl value
   * @param fieldName The field name
   * @param fieldTtl The hash field ttl value for Redis databases 7.3.4 and higher
   */
  async editHashKeyTtl(
    fieldName: string,
    fieldTtl: string = '',
  ): Promise<void> {
    const enteredText = await this.getElementText(
      this.getFieldTtlInputByField(fieldName),
    )
    const count = enteredText.length

    await InputActions.hoverElement(
      this.getFieldTtlInputByField(fieldName),
      1000,
    )
    await ButtonActions.clickElement(this.getEditFieldByField(fieldName))

    // clear the input
    for (let i = 0; i < count; i++) {
      await InputActions.pressKey(this.hashFieldTtlEditor, Key.BACK_SPACE)
    }
    await InputActions.typeText(this.hashFieldTtlEditor, fieldTtl)
    await ButtonActions.clickElement(this.applyButton)
    await CommonDriverExtension.driverSleep(1000)
  }
}
