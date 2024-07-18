import { expect } from 'chai'
import { describe, it } from 'mocha'
import {
  before,
  beforeEach,
  after,
  afterEach,
  VSBrowser,
  ActivityBar,
  TitleBar,
} from 'vscode-extension-tester'
import { ServerActions } from '@e2eSrc/helpers/common-actions/ServerActions'
import { InnerViews } from '@e2eSrc/page-objects/components/WebView'
import {
  AddDatabaseView,
  EulaView,
  TreeView,
} from '@e2eSrc/page-objects/components'
import { ButtonActions, CheckboxActions } from '@e2eSrc/helpers/common-actions'
import { WelcomeView } from '@e2eSrc/page-objects/components/editor-view/WelcomeView'

describe('Agreements Verification', () => {
  let browser: VSBrowser
  let treeView: TreeView
  let eulaView: EulaView
  let welcomeView: WelcomeView
  let addDatabaseView: AddDatabaseView

  before(async () => {
    browser = VSBrowser.instance
    treeView = new TreeView()
    eulaView = new EulaView()
    addDatabaseView = new AddDatabaseView()
    welcomeView = new WelcomeView()

    await ServerActions.waitForServerInitialized()
    await browser.waitForWorkbench(20_000)
    await  new TitleBar().getWindowControls().maximize()
    await (await new ActivityBar().getViewControl('Redis Insight'))?.openView()
  })
  beforeEach(async () => {
    await eulaView.switchToInnerViewFrame(InnerViews.EulaInnerView)
    await eulaView.waitForElementVisibility(eulaView.submitButton)
  })
  after(async () => {
    await treeView.switchBack()
  })
  afterEach(async () => {
    await treeView.switchBack()
  })

  it('Verify that user should accept User Agreements to continue working with the application', async () => {
    expect(
      await eulaView.waitForElementVisibility(eulaView.eulaPageContainer),
    ).eql(true, 'User Agreements is not shown')
    // Verify that I still has agreements popup & cannot add a database
    await eulaView.switchBack()
    expect(await eulaView.isElementDisplayed(treeView.addDatabaseBtn)).eql(
      false,
      'User can add a database',
    )
    expect(await eulaView.isElementDisplayed(treeView.databaseInstance)).eql(
      false,
      'User can see databases',
    )
    await eulaView.switchToInnerViewFrame(InnerViews.EulaInnerView)
    // Verify that the encryption enabled by default and specific message
    // TODO unskip once encryption enabled on ci
    // expect(
    //   await CheckboxActions.getCheckboxState(eulaView.encryptionCheckbox),
    // ).eql(true, 'Encryption switcher is not checked')
    // Verify that Submit button disabled by default if EULA not accepted
    expect(
      await eulaView.isElementDisabled(eulaView.submitButton, 'class'),
    ).eql(true, 'Submut button not disabled by default')
  })

  it('Verify that when user checks "Use recommended settings" option on EULA screen, all options (except Licence Terms) are checked', async () => {
    // Verify options unchecked before enabling Use recommended settings
    expect(
      await CheckboxActions.getCheckboxState(eulaView.analyticsCheckbox),
    ).eql(false, 'Enable Analytics switcher is checked')
    expect(
      await CheckboxActions.getCheckboxState(eulaView.useRecommendedCheckbox),
    ).eql(false, 'Use recommended settings switcher is checked')
    expect(await CheckboxActions.getCheckboxState(eulaView.eulaCheckbox)).eql(
      false,
      'EULA switcher is checked',
    )
    // Check Use recommended settings switcher
    await CheckboxActions.toggleCheckbox(eulaView.useRecommendedCheckbox, true)
    // Verify options checked after enabling Use recommended settings
    expect(
      await CheckboxActions.getCheckboxState(eulaView.analyticsCheckbox),
    ).eql(true, 'Enable Analytics switcher is not checked')
    // TODO unskip once encryption enabled on ci
    // expect(
    //   await CheckboxActions.getCheckboxState(eulaView.encryptionCheckbox),
    // ).eql(true, 'Encryption switcher is not checked')
    // Uncheck Use recommended settings switcher
    await CheckboxActions.toggleCheckbox(eulaView.useRecommendedCheckbox, false)
    // Verify that when user unchecks "Use recommended settings" option on EULA screen, previous state of checkboxes for the options is applied
    expect(
      await CheckboxActions.getCheckboxState(eulaView.analyticsCheckbox),
    ).eql(false, 'Enable Analytics switcher is checked')
    // TODO unskip once encryption enabled on ci
    // expect(
    //   await CheckboxActions.getCheckboxState(eulaView.encryptionCheckbox),
    // ).eql(true, 'Encryption switcher is not checked')
    expect(await CheckboxActions.getCheckboxState(eulaView.eulaCheckbox)).eql(
      false,
      'EULA switcher is checked',
    )
  })

  it('Verify that if "Use recommended settings" is selected, and user unchecks any of the option, "Use recommended settings" is unchecked', async () => {
    // Check Use recommended settings switcher
    await CheckboxActions.toggleCheckbox(eulaView.useRecommendedCheckbox, true)
    // Verify Use recommended settings switcher unchecked after unchecking analytics switcher
    await CheckboxActions.toggleCheckbox(eulaView.analyticsCheckbox, false)
    expect(
      await CheckboxActions.getCheckboxState(eulaView.useRecommendedCheckbox),
    ).eql(false, 'Use recommended settings switcher is still checked')
    // TODO unskip once encryption enabled on ci
    // Check Use recommended settings switcher
    // await CheckboxActions.toggleCheckbox(eulaView.useRecommendedCheckbox, true)
    // Verify Use recommended settings switcher unchecked after unchecking encryption switcher
    // await CheckboxActions.toggleCheckbox(eulaView.encryptionCheckbox, false)
    // expect(
    //   await CheckboxActions.getCheckboxState(eulaView.useRecommendedCheckbox),
    // ).eql(false, 'Use recommended settings switcher is still checked')
  })

  it('Verify that user can accept User Agreements', async () => {
    const expectedWelcomeLinks = ['https://redis.io/docs/install/install-stack/docker/?utm_source=redisinsight&utm_medium=main&utm_campaign=docker']
    await CheckboxActions.toggleCheckbox(eulaView.useRecommendedCheckbox, true)
    await CheckboxActions.toggleCheckbox(eulaView.eulaCheckbox, true)
    await ButtonActions.clickElement(eulaView.submitButton)
    await eulaView.waitForElementVisibility(
      eulaView.eulaPageContainer,
      3000,
      false,
    )
    // Verify that user is able to add database after accepting EULA
    await eulaView.switchBack()

   // Verify that user can see  Welcome page with connect links
    await eulaView.switchToInnerViewFrame(InnerViews.Welcome)
    expect(await welcomeView.verifyConnectLinks(expectedWelcomeLinks)).eql(true,
      'Links are not expected on the Welcome page ')
    await welcomeView.switchBack()

    expect(await treeView.isElementDisplayed(treeView.addDatabaseBtn)).eql(
      true,
      'User can not add a database',
    )
    await ButtonActions.clickElement(treeView.addDatabaseBtn)
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
