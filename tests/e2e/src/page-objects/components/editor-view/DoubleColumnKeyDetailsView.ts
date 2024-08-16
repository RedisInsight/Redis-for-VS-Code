import { By } from 'selenium-webdriver'
import { ButtonActions, InputActions } from '@e2eSrc/helpers/common-actions'
import { KeyDetailsView } from './KeyDetailsView'

/**
 * Base view for all keyTypes that have 2 columns value
 */
export class DoubleColumnKeyDetailsView extends KeyDetailsView {
  applyButton = By.xpath(
    '//*[@data-testid="virtual-table-container"]//*[@data-testid="apply-btn"]',
  )
  getEditButton = (keyType: string, name: string): By =>
    By.xpath(
      `//*[contains(@data-testid, "edit-${keyType}-button-${name}")] | //*[contains(@data-testid, "${keyType}_edit-btn-${name}")]`,
    )
  getWrapperOfValueInput  = (keyType: string, name: string): By =>
    By.xpath(`//*[contains(@data-testid, "${keyType}_content-value-${name}")]/parent::*`)

  /**
   * Edit key value from details
   * @param value The value of the key
   * @param name The field value
   * @param editorLocator The locator of the edit field
   * @param keyType The key type
   */
  protected async editKeyValue(
    value: string,
    name: string,
    editorLocator: By,
    keyType: string,
  ): Promise<void> {
    await InputActions.hoverElement(this.getWrapperOfValueInput(keyType, name),1000)
    const editLocator = this.getEditButton(keyType, name)
    await ButtonActions.clickElement(editLocator)
    await InputActions.typeText(editorLocator, value)
    await ButtonActions.clickElement(this.applyButton)
  }

  /**
   * Edit key value from details with slow typing
   * @param value The value of the key
   * @param name The field value
   * @param editorLocator The locator of the edit field
   * @param keyType The key type
   */
  protected async editKeyValueSlow(
    value: string,
    name: string,
    editorLocator: By,
    keyType: string,
  ): Promise<void> {
    await InputActions.hoverElement(this.getWrapperOfValueInput(keyType, name),1000)
    const editLocator = this.getEditButton(keyType, name)
    await ButtonActions.clickElement(editLocator)
    await InputActions.slowType(editorLocator, value)
    await ButtonActions.clickElement(this.applyButton)
  }
}
