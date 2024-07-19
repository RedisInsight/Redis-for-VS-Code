import { By } from 'selenium-webdriver'
import { DatabaseDetailsView } from './DatabaseDetailsView'

/**
 * Edit Database view
 */
export class EditDatabaseView extends DatabaseDetailsView {
  moduleSearchIcon = By.xpath(`//*[contains(@data-testid, 'RediSearch')]`)
  moduleGraphIcon = By.xpath(`//*[contains(@data-testid, 'RedisGraph')]`)
  moduleJSONIcon = By.xpath(`//*[contains(@data-testid, 'RedisJSON')]`)
  moduleTimeseriesIcon = By.xpath(`//*[contains(@data-testid, 'RedisTimeSeries')]`)
  moduleBloomIcon = By.xpath(`//*[contains(@data-testid, 'RedisBloom')]`)
  moduleAIIcon = By.xpath(`//*[contains(@data-testid, 'RedisAI')]`)
  moduleGearsIcon = By.xpath(`//*[contains(@data-testid, 'RedisGears')]`)
}
