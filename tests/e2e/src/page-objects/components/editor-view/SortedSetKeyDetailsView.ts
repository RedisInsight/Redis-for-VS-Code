import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/editor-view/DoubleColumnKeyDetailsView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'

/**
 * Sorted Set Key details view
 */
export class SortedSetKeyDetailsView extends DoubleColumnKeyDetailsView {
  scoreButton = By.xpath(`//*[@data-testid = 'header-sorting-button']`)
  sortedSetFieldsList = By.xpath(
    `//*[contains(@data-testid, 'zset-member-value-')]`,
  )
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'zset-member-value-')]//*[contains(@aria-describedby, 'popup')]`,
  )
  scoreSortedSetFieldsList = By.xpath(
    `//*[contains(@data-testid, 'zset_content-value-')]`,
  )
  sortedSetScoreEditor   = (score: string): By => By.xpath(
    `//*[@id = '${score}' and @data-testId = 'inline-item-editor']`,
  )
  zsetMemberScoreInput = By.xpath(`//*[starts-with(@data-testid, 'member-score')]`)

  /**
   * Edit Sorted Set key value from details
   * @param value The value of the key
   * @param name The field value
   */
  async editSortedSetKeyValue(value: string, name: string): Promise<void> {
    await super.editKeyValueSlow(
      value,
      name,
      this.sortedSetScoreEditor(name),
      KeyTypesShort.ZSet,
    )
  }

  /**
   * Add member to the ZSet key
   * @param keyMember The value of the Zset member
   * @param score The value of the score
   */
  async addMemberToZSet(keyMember: string, score: number): Promise<void> {
    await ButtonActions.clickElement(this.addKeyValueItemsButton)
    await InputActions.typeText(this.setMemberInput, keyMember)
    await InputActions.typeText(this.zsetMemberScoreInput, `${score}`)
    await ButtonActions.clickElement(this.saveMemberButton)
  }
}
