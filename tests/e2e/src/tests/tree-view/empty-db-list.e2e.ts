import { expect } from 'chai'
import { describe, it } from 'mocha'
import { before, after} from 'vscode-extension-tester'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import {
  TreeView,
  AddDatabaseView,
} from '@e2eSrc/page-objects/components'
import { EmptyDatabaseView } from '@e2eSrc/page-objects/components/tree-view/EmptyDatabaseView'
import { ButtonActions, DatabasesActions } from '@e2eSrc/helpers/common-actions'
import { CommonElementActions } from '@e2eSrc/helpers/common-actions/actions/CommonElementActions'

describe('Empty database', () => {
  let treeView: TreeView
  let emptyView: EmptyDatabaseView
  let addDatabaseView: AddDatabaseView

  before(async () => {
    treeView = new TreeView()
    emptyView = new EmptyDatabaseView()
    addDatabaseView = new AddDatabaseView()

    await emptyView.waitForElementVisibility(emptyView.completedProgressBar)
    await DatabasesActions.refreshDatabasesView()
    await emptyView.switchToInnerViewFrame(InnerViews.EmptyDatabaseInnerView)

  })

  after(async () => {
    await addDatabaseView.switchBack()
  })

  it('Verify that form to add database can be opened from empty db page', async function () {
    const expectedWelcomeLinks = ['https://redis.io/try-free/?utm_source=redisinsight&utm_medium=vscode&utm_campaign=empty_database', 'https://hub.docker.com/r/redis/redis-stack-server']

    await ButtonActions.clickElement(emptyView.connectDatabaseButton)

    expect(await CommonElementActions.verifyConnectLinks(expectedWelcomeLinks, emptyView.connectLinks)).eql(true,
      'Links are not expected on the empty db screen page ')
    await treeView.switchBack()
    await addDatabaseView.switchToInnerViewFrame(
      InnerViews.AddDatabaseInnerView,
    )
    expect(
      await addDatabaseView.isElementDisplayed(
        addDatabaseView.databaseAliasInput,
      ),
    ).eql(true, 'Add database page not opened')
  })
})
