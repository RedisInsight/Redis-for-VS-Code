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
}
