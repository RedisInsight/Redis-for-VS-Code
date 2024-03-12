import { Locator } from 'vscode-extension-tester'
import { Views } from '@e2eSrc/page-objects/components/WebView'
import {
  WebView,
  TreeView,
  EditDatabaseView,
} from '@e2eSrc/page-objects/components'
import {
  DatabasesActions,
} from '@e2eSrc/helpers/common-actions'
import { DatabaseAPIRequests } from '@e2eSrc/helpers/api'
import { Common, CommonDriverExtension, Config } from '@e2eSrc/helpers'

describe('Database modules', () => {
  let webView: WebView
  let treeView: TreeView
  let editDatabaseView: EditDatabaseView
  let moduleList: Locator[]
  const uniqueId = Common.generateString(10)
  let database = {
    ...Config.ossStandaloneRedisearch,
    databaseName: `test_standalone-redisearch-${uniqueId}`,
  }

  beforeEach(async () => {
    webView = new WebView()
    treeView = new TreeView()

    await DatabasesActions.acceptLicenseTermsAndAddDatabaseApi(database)
    await treeView.editDatabaseByName(database.databaseName)
    await CommonDriverExtension.driverSleep(2000)
    await webView.switchBack()
    await webView.switchToFrame(Views.DatabaseDetailsView)
  })
  afterEach(async () => {
    await webView.switchBack()
    await DatabaseAPIRequests.deleteAllDatabasesApi()
  })
  it('Verify that user can see full module list in the Edit mode', async function () {
    moduleList = [
      editDatabaseView.moduleSearchIcon,
      editDatabaseView.moduleJSONIcon,
      editDatabaseView.moduleGraphIcon,
      editDatabaseView.moduleTimeseriesIcon,
      editDatabaseView.moduleBloomIcon,
      editDatabaseView.moduleGearsIcon,
      editDatabaseView.moduleAIIcon,
    ]
    // Verify modules in Edit mode
    await DatabasesActions.checkModulesOnPage(moduleList)
  })
})
