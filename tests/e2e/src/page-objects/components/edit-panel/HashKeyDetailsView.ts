import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/edit-panel/DoubleColumnKeyDetailsView'

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
  trashIcon = (name: string): By =>
    By.xpath(`//*[@data-testid="remove-hash-button-${name}-icon"]`)
  removeButton = (name: string): By =>
    By.xpath(`//*[@data-testid="remove-hash-button-${name}"]`)
  editHashButton = (name: string): By =>
    By.xpath(`//*[@data-testid="edit-hash-button-${name}"]`)

  /**
   * Remove row by field
   * @param name The field value
   */
  async removeRowByField(name: string): Promise<void> {
    await super.removeRowByField(name, this.trashIcon)
  }

  /**
   * Click on remove button by field
   * @param name The field value
   */
  async clickRemoveRowButtonByField(name: string): Promise<void> {
    await super.clickRemoveRowButtonByField(name, this.removeButton)
  }

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
      this.editHashButton,
    )
  }
}
