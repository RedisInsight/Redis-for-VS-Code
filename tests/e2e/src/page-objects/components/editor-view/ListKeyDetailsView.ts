import { By } from 'selenium-webdriver'
import { expect } from 'chai'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/editor-view/DoubleColumnKeyDetailsView'
import { AddElementInList, KeyTypesShort } from '@e2eSrc/helpers/constants'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'

/**
 * List Key details view
 */
export class ListKeyDetailsView extends DoubleColumnKeyDetailsView {
  listValueEditor = By.xpath(`//*[contains(@data-testid,'list_value-editor')]`)
  indexesList = By.xpath(
    `//*[contains(@data-testid, 'list-index-') and not(contains(@data-testid,'element'))]/div`,
  )
  elementsList = By.xpath(`//*[contains(@data-testid, 'list_content-')]`)
  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'list-element-')]//*[@class='truncate']`,
  )

  addAdditionalElement = By.xpath(`//*[@data-testid='add-new-item']`)

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
  destinationSelect = By.xpath(`//vscode-dropdown[@data-testid='destination-select']`)
  fromHeadSelection = By.xpath(`//*[@data-testid='HEAD']`)
  countInput = By.xpath(`//*[@data-testid='count-input']`)

  getElementValueByText = (text: string): By =>
    By.xpath(
      `//*[contains(@data-testid, 'list-element-value-')]/*[contains(text(), '${text}')]`,
    )

  getElementValueByIndex = (index: number): By =>
    By.xpath(
      `//*[@data-testid='list-element-value-${index}']`,
    )

  getElementValueInput = (index: number): By =>
    By.xpath(
      `//*[@data-testid='element-${index}']`,
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
  async addListElement(element: string[], position: AddElementInList = AddElementInList.Tail): Promise<void> {
    await ButtonActions.clickElement(this.addKeyValueItemsButton)

    if(position === AddElementInList.Head){
      await ButtonActions.clickAndWaitForElement(
        this.destinationSelect,
        this.fromHeadSelection,
      )
      await ButtonActions.clickAndWaitForElement(this.fromHeadSelection, this.fromHeadSelection, false)
    }
    for (let i = 0; i < element.length; i++){
      await InputActions.typeText(this.getElementValueInput(i), element[i])

      if (element.length > 1 && i < element.length - 1) {
        await ButtonActions.clickElement(this.addAdditionalElement)
      }
    }
    await ButtonActions.clickElement(this.saveElementButton)
  }

  /**
   * Remove List element from head for Redis databases less then v. 6.2.
   */
  async removeListElementFromHeadOld(): Promise<void> {
    await ButtonActions.clickElement(this.removeElementFromListIconButton)
    expect(await super.isElementDisabled(this.countInput, 'class')).eql(
      true,
      'Count Input not disabled',
    )
    //Select Remove from head selection
    await ButtonActions.clickAndWaitForElement(
      this.destinationSelect,
      this.fromHeadSelection,
    )
    await ButtonActions.clickElement(this.fromHeadSelection)
    //Confirm removing
    await ButtonActions.clickElement(this.removeElementFromListButton)
    await ButtonActions.clickElement(this.confirmRemoveListElementButton)
  }

  /**
   * Remove List element from tail
   * @param count The count if elements for removing
   */
  async removeListElementFromTail(count: string): Promise<void> {
    await ButtonActions.clickElement(this.removeElementFromListIconButton)
    await InputActions.typeText(this.countInput, count)
    await ButtonActions.clickElement(this.removeElementFromListButton)
    await ButtonActions.clickElement(this.confirmRemoveListElementButton)
  }

  /**
   * Remove List element from head
   * @param count The count if elements for removing
   */
  async removeListElementFromHead(count: string): Promise<void> {
    await ButtonActions.clickElement(this.removeElementFromListIconButton)
    //Enter count of the removing elements
    await InputActions.typeText(this.countInput, count)
    //Select Remove from head selection
    await ButtonActions.clickAndWaitForElement(
      this.destinationSelect,
      this.fromHeadSelection,
    )
    await ButtonActions.clickElement(this.fromHeadSelection)
    //Confirm removing
    await ButtonActions.clickElement(this.removeElementFromListButton)
    await ButtonActions.clickElement(this.confirmRemoveListElementButton)
  }
}
