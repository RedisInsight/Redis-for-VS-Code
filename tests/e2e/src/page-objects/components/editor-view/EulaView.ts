import { By } from 'selenium-webdriver'
import { WebView } from '@e2eSrc/page-objects/components/WebView'
import { ButtonActions, CheckboxActions } from '@e2eSrc/helpers/common-actions'

/**
 * Eula view
 */
export class EulaView extends WebView {
  eulaPageContainer = By.xpath(`//div[@data-testid='eula-page']`)
  encryptionCheckbox = By.xpath(
    `//*[@data-testid='check-option-encryption']/..`,
  )
  analyticsCheckbox = By.xpath(`//*[@data-testid='check-option-analytics']/..`)
  useRecommendedCheckbox = By.xpath(
    `//*[@data-testid='switch-option-recommended']/..`,
  )
  eulaCheckbox = By.xpath(`//*[@data-testid='check-option-eula']/..`)
  submitButton = By.xpath(`//vscode-button[@data-testid='btn-submit']`)

  /**
   * Accept Redis for VS Code License Terms
   */
  //
  async acceptLicenseTerms(): Promise<void> {
    if (await this.isElementDisplayed(this.eulaPageContainer)) {
      await CheckboxActions.toggleCheckbox(this.useRecommendedCheckbox, true)
      await CheckboxActions.toggleCheckbox(this.eulaCheckbox, true)
      await ButtonActions.clickElement(this.submitButton)
      await this.waitForElementVisibility(this.eulaPageContainer, 3000, false)
    }
  }
}
