import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/edit-panel/DoubleColumnKeyDetailsView'
import { ButtonsActions } from '@e2eSrc/helpers/common-actions'

/**
 * Sorted Set Key details view
 */
export class SortedSetKeyDetailsView extends DoubleColumnKeyDetailsView {
  scoreButton = By.xpath(`//*[@data-testid = 'header-sorting-button']`)

  sortedSetFieldsList = By.xpath(
    `//*[contains(@data-testid, 'zset-member-value-')]`,
  )
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'zset-member-value-')]//*[@class = 'truncate']`,
  )
  scoreSortedSetFieldsList = By.xpath(
    `//*[contains(@data-testid, 'zset-score-value-')]`,
  )

  sortedSetScoreEditor = By.xpath(
    `//*[@id = 'score' and @data-testId = 'inline-item-editor']`,
  )

  editSortedSetButton = (name: string): By =>
    By.xpath(`//*[@data-testid="zset-edit-button-${name}"]`)
  trashIcon = (name: string): By =>
    By.xpath(`//*[@data-testid="zset-remove-button-${name}-icon"]`)
  removeButton = (name: string): By =>
    By.xpath(`//*[@data-testid="zset-remove-button-${name}"]`)

  /**
   * Edit Sorted Set key value from details
   * @param value The value of the key
   * @param name The field value
   */
  async editSortedSetKeyValue(value: string, name: string): Promise<void> {
    await super.editKeyValue(
      value,
      name,
      this.sortedSetScoreEditor,
      this.editSortedSetButton,
    )
  }

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
}
