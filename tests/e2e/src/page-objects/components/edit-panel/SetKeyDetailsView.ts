import { By } from 'selenium-webdriver'
import { DoubleColumnKeyDetailsView } from '@e2eSrc/page-objects/components/edit-panel/DoubleColumnKeyDetailsView'
import { KeyTypesShort } from '@e2eSrc/helpers/constants'
import { KeyDetailsView } from '@e2eSrc/page-objects/components'

/**
 * Sorted Set Key details view
 */
export class SetKeyDetailsView extends KeyDetailsView {
  setFieldsList = By.xpath(`//*[contains(@data-testid, 'set-member-value-')]`)

  truncatedValue = By.xpath(
    `//*[contains(@data-testid, 'set-member-value-')]//*[@class = 'truncate']`,
  )
}
