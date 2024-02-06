import { ActivityBar, Locator, VSBrowser } from 'vscode-extension-tester'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import {
  WebView,
  KeyTreeView,
  EditDatabaseView,
} from '@e2eSrc/page-objects/components'
import {
  ButtonActions,
  DatabasesActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
// import { Common, Config } from '@e2eSrc/helpers'

describe('Database modules', () => {
  let browser: VSBrowser
  let webView: WebView
  let keyTreeView: KeyTreeView
  let editDatabaseView: EditDatabaseView
  let moduleList: Locator[]
//   const uniqueId = Common.generateString(10)
//   let database = {
//     ...Config.ossStandaloneRedisearch,
//     databaseName: `test_standalone-redisearch-${uniqueId}`,
//   }

  beforeEach(async () => {
    browser = VSBrowser.instance
    webView = new WebView()
    keyTreeView = new KeyTreeView()
    moduleList = [
      editDatabaseView.moduleSearchIcon,
      editDatabaseView.moduleJSONIcon,
      editDatabaseView.moduleGraphIcon,
      editDatabaseView.moduleTimeseriesIcon,
      editDatabaseView.moduleBloomIcon,
      editDatabaseView.moduleGearsIcon,
      editDatabaseView.moduleAIIcon,
    ]

    // TODO unskip once switching between databases implemented
    // await DatabaseAPIRequests.addNewStandaloneDatabaseApi(database)
    await browser.waitForWorkbench(20_000)
    await (await new ActivityBar().getViewControl('RedisInsight'))?.openView()
    await webView.switchToFrame(Views.KeyTreeView)
    await ButtonActions.clickElement(keyTreeView.editDatabaseBtn)
    await webView.switchBack()
    await webView.switchToFrame(Views.DatabaseDetailsView)
  })
  afterEach(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can see full module list in the Edit mode', async function () {
    // Verify modules in Edit mode
    await DatabasesActions.checkModulesOnPage(moduleList)
  })
})
