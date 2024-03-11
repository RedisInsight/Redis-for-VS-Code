import { By } from 'selenium-webdriver'
import { expect } from 'chai'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/edit-panel/DoubleColumnKeyDetailsView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { InputActions } from '@e2eSrc/helpers/common-actions'

/**
 * List Key details view
 */
export class ListKeyDetailsView extends DoubleColumnKeyDetailsView {
  listValueEditor = By.xpath(`//*[@data-testid='element-value-editor']`)
  indexesList = By.xpath(
    `//*[contains(@data-testid, 'list-index-') and not(contains(@data-testid,'element'))]/div`,
  )
  elementsList = By.xpath(`//*[contains(@data-testid, 'list-element-')]/div`)
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'list-element-')]//*[@class='truncate']`,
  )
  addListKeyElementInput = By.xpath(`//*[@data-testid='elements-input']`)
  saveElementButton = By.xpath(`//*[@data-testid='save-elements-btn']`)
  removeElementFromListIconButton = By.xpath(
    `//*[@data-testid='remove-key-value-items-btn']`,
  )
  removeElementFromListButton = By.xpath(
    `//*[@data-testid='remove-elements-btn-trigger']`,
  )
  confirmRemoveListElementButton = By.xpath(
    `//*[@data-testid='remove-elements-btn']`,
  )
  removeElementFromListSelect = By.xpath(`//vscode-dropdown[@role='combobox']`)
  removeFromHeadSelection = By.xpath(`//*[@data-testid='HEAD']`)
  countInput = By.xpath(`//*[@data-testid='count-input']`)

  elementValueByText = (text: string): By =>
    By.xpath(
      `//*[contains(@data-testid, 'list-element-value-')]/*[contains(text(), '${text}')]`,
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

  /**
   * Add element to the List key to tail
   * @param element The value of the list element
   */
  async addListElementToTail(element: string): Promise<void> {
    await (await this.getElement(this.addKeyValueItemsButton)).click()
    await InputActions.typeText(this.addListKeyElementInput, element)
    await (await this.getElement(this.saveElementButton)).click()
  }

  /**
   * Add element to the List key to tail
   * @param element The value of the list element
   */
  async addListElementToHead(element: string): Promise<void> {
    await (await this.getElement(this.addKeyValueItemsButton)).click()
    await (await this.getElement(this.removeElementFromListSelect)).click()
    await this.waitElementToBeVisible(this.removeFromHeadSelection)
    await (await this.getElement(this.removeFromHeadSelection)).click()
    await InputActions.typeText(this.addListKeyElementInput, element)
    await (await this.getElement(this.saveElementButton)).click()
  }

  /**
   * Remove List element from tail for Redis databases less then v. 6.2.
   */
  async removeListElementFromTailOld(): Promise<void> {
    await (await this.getElement(this.removeElementFromListIconButton)).click()
    expect(await this.isElementDisabled(this.countInput, 'class')).eql(
      true,
      'Count Input not disabled',
    )
    await (await this.getElement(this.removeElementFromListButton)).click()
    await (await this.getElement(this.confirmRemoveListElementButton)).click()
  }

  /**
   * Remove List element from head for Redis databases less then v. 6.2.
   */
  async removeListElementFromHeadOld(): Promise<void> {
    await (await this.getElement(this.removeElementFromListIconButton)).click()
    expect(await this.isElementDisabled(this.countInput, 'class')).eql(
      true,
      'Count Input not disabled',
    )
    //Select Remove from head selection
    await (await this.getElement(this.removeElementFromListSelect)).click()
    await this.waitElementToBeVisible(this.removeFromHeadSelection)
    await (await this.getElement(this.removeFromHeadSelection)).click()
    //Confirm removing
    await (await this.getElement(this.removeElementFromListButton)).click()
    await (await this.getElement(this.confirmRemoveListElementButton)).click()
  }

  /**
   * Remove List element from tail
   * @param count The count if elements for removing
   */
  async removeListElementFromTail(count: string): Promise<void> {
    await (await this.getElement(this.removeElementFromListIconButton)).click()
    await InputActions.typeText(this.countInput, count)
    await (await this.getElement(this.removeElementFromListButton)).click()
    await (await this.getElement(this.confirmRemoveListElementButton)).click()
  }

  /**
   * Remove List element from head
   * @param count The count if elements for removing
   */
  async removeListElementFromHead(count: string): Promise<void> {
    await (await this.getElement(this.removeElementFromListIconButton)).click()
    //Enter count of the removing elements
    await InputActions.typeText(this.countInput, count)
    //Select Remove from head selection
    await (await this.getElement(this.removeElementFromListSelect)).click()
    await this.waitElementToBeVisible(this.removeFromHeadSelection)
    await (await this.getElement(this.removeFromHeadSelection)).click()
    //Confirm removing
    await (await this.getElement(this.removeElementFromListButton)).click()
    await (await this.getElement(this.confirmRemoveListElementButton)).click()
  }
}
