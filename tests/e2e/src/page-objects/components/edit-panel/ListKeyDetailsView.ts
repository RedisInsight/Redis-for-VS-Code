import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/edit-panel/DoubleColumnKeyDetailsView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'

/**
 * List Key details view
 */
export class ListKeyDetailsView extends DoubleColumnKeyDetailsView {
  listValueEditor = By.xpath(`//*[@data-testid = 'element-value-editor']`)
  indexesList = By.xpath(
    `//*[contains(@data-testid, 'list-index-') and not(contains(@data-testid,'element'))]/div`,
  )
  elementsList = By.xpath(`//*[contains(@data-testid, 'list-element-')]/div`)
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'list-element-')]//*[@class = 'truncate']`,
  )

  /**
   * Edit List key element from details
   * @param value The value of the key
   * @param name The element value
   */
  async editListKeyValue(value: string, name: string): Promise<void> {
    await super.editKeyValue(
      value,
      name,
      this.listValueEditor,
      KeyTypesShort.List,
    )
  }
}
