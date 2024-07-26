import { By } from 'selenium-webdriver'
import { KeyDetailsView } from '@e2eSrc/page-objects/components'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { CommonDriverExtension } from '@e2eSrc/helpers'

/**
 * JSON Key details view
 */
export class JsonKeyDetailsView extends KeyDetailsView {
  addJsonObjectButton = By.xpath(`//*[@data-testid='add-object-btn']`)
  jsonKeyValue = By.xpath(`//*[@data-testid='json-data']`)
  jsonKeyInput = By.xpath(`//*[@data-testid='json-key']`)
  jsonValueInput = By.xpath(`//*[@data-testid='json-value']`)
  expandJsonObject = By.xpath(`//*[@data-testid='expand-object']`)
  addJsonFieldButton = By.xpath(`//*[@data-testid='add-field-btn']`)
  jsonScalarValue = By.xpath(`//*[@data-testid='json-scalar-value']`)
  inlineItemEditor = By.xpath(`//*[@data-testid='inline-item-editor']`)
  editJsonObjectButton = By.xpath(`//*[@data-testid='edit-json-field']`)
  jsonError = By.xpath(`//*[@data-testid='edit-json-error']`)
  removeJsonFieldIcon = By.xpath(
    `//*[@data-testid='remove-json-field-trigger']`,
  )
  removeJsonFieldConfirmBtn = By.xpath(`//*[@data-testid='remove-json-field']`)
  removeTrigger = By.xpath(`//*[@data-testid='remove-trigger']`)
  removeJsonKeyConfirmBtn = By.xpath(`//*[@data-testid='remove']`)
  applyJsonInput = By.xpath(
    `//*[@data-testid='json-data']//*[@data-testid='apply-btn']`,
  )

  getJsonScalarValueByText = (text: string): By =>
    By.xpath(
      `//*[@data-testid='json-scalar-value' and contains(text(), '${text}')]`,
    )
  getJsonScalarValueByIndex = (index: number): By =>
    By.xpath(`(//*[@data-testid='json-scalar-value'])[${index}]`)

  /**
   * Add json key with value on the same level of the structure
   * @param jsonKey The json key name
   * @param jsonKeyValue The value of the json key
   */
  async addJsonKeyOnTheSameLevel(
    jsonKey: string,
    jsonKeyValue: string,
  ): Promise<void> {
    await this.waitForElementVisibility(this.addJsonObjectButton)
    await ButtonActions.clickElement(this.addJsonObjectButton)
    await InputActions.typeText(this.jsonKeyInput, jsonKey)
    await InputActions.typeText(this.jsonValueInput, jsonKeyValue)
    await ButtonActions.clickElement(this.applyJsonInput)
    await CommonDriverExtension.driverSleep(500)
  }

  /**
   * Add json key with value inside the Json structure
   * @param jsonKey The json key name
   * @param jsonKeyValue The value of the json key
   */
  async addJsonKeyInsideStructure(
    jsonKey: string,
    jsonKeyValue: string,
  ): Promise<void> {
    await this.waitForElementVisibility(this.expandJsonObject)
    await ButtonActions.clickElement(this.expandJsonObject)
    await ButtonActions.clickElement(this.addJsonFieldButton)
    await InputActions.typeText(this.jsonKeyInput, jsonKey)
    await InputActions.typeText(this.jsonValueInput, jsonKeyValue)
    await ButtonActions.clickElement(this.applyJsonInput)
    await CommonDriverExtension.driverSleep(500)
  }

  /**
   * Add json structure
   * @param jsonStructure The structure of the json key
   */
  async addJsonStructure(jsonStructure: string): Promise<void> {
    if (await super.isElementDisplayed(this.expandJsonObject)) {
      await ButtonActions.clickElement(this.expandJsonObject)
    }
    await this.waitForElementVisibility(this.editJsonObjectButton)
    await ButtonActions.clickElement(this.editJsonObjectButton)
    await InputActions.typeText(this.jsonValueInput, jsonStructure)
    await ButtonActions.clickElement(this.applyEditButton)
    await CommonDriverExtension.driverSleep(500)
  }
}
