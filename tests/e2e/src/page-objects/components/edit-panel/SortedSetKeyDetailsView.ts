import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/edit-panel/DoubleColumnKeyDetailsView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { InputActions } from '@e2eSrc/helpers/common-actions'

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
  zsetMemberScoreInput = By.xpath(`//*[@data-testid = 'member-score']`)

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
      KeyTypesShort.ZSet,
    )
  }

  /**
   * Add member to the ZSet key
   * @param keyMember The value of the Zset member
   * @param score The value of the score
   */
  async addMemberToZSet(keyMember: string, score: number): Promise<void> {
    await (await this.getElement(this.addKeyValueItemsButton)).click()
    await InputActions.typeText(this.setMemberInput, keyMember)
    await InputActions.typeText(this.zsetMemberScoreInput, `${score}`)
    await (await this.getElement(this.saveMemberButton)).click()
  }
}
