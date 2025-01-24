import AzureIcon from 'uiSrc/assets/oauth/azure_provider.svg?react'
import AWSIcon from 'uiSrc/assets/oauth/aws_provider.svg?react'
import GoogleIcon from 'uiSrc/assets/oauth/google_provider.svg?react'

export enum OAuthSocialSource {
  Browser = 'browser',
  ListOfDatabases = 'list of databases',
  DatabaseConnectionList = 'database connection list',
  WelcomeScreen = 'welcome screen',
  BrowserContentMenu = 'browser content menu',
  BrowserFiltering = 'browser filtering',
  BrowserSearch = 'browser search',
  RediSearch = 'workbench RediSearch',
  RedisJSON = 'workbench RedisJSON',
  RedisTimeSeries = 'workbench RedisTimeSeries',
  RedisGraph = 'workbench RedisGraph',
  RedisBloom = 'workbench RedisBloom',
  Autodiscovery = 'autodiscovery',
  SettingsPage = 'settings',
  ConfirmationMessage = 'confirmation message',
  Workbench = 'workbench',
  Tutorials = 'tutorials',
  EmptyDatabasesList = 'empty_db_list',
  DatabasesList = 'db_list',
  DiscoveryForm = 'discovery form',
  UserProfile = 'user profile',
  AiChat = 'ai chat',
  NavigationMenu = 'navigation menu',
  AddDbForm = 'add db form',
}

export enum CloudJobStatus {
  Initializing = 'initializing',
  Running = 'running',
  Finished = 'finished',
  Failed = 'failed',
}

export enum CloudJobName {
  CreateFreeSubscriptionAndDatabase = 'CREATE_FREE_SUBSCRIPTION_AND_DATABASE',
  CreateFreeDatabase = 'CREATE_FREE_DATABASE',
  CreateFreeSubscription = 'CREATE_FREE_SUBSCRIPTION',
  ImportFreeDatabase = 'IMPORT_FREE_DATABASE',
  WaitForActiveDatabase = 'WAIT_FOR_ACTIVE_DATABASE',
  WaitForActiveSubscription = 'WAIT_FOR_ACTIVE_SUBSCRIPTION',
  WaitForTask = 'WAIT_FOR_TASK',
  Unknown = 'UNKNOWN',
}

export enum CloudJobStep {
  Credentials = 'credentials',
  Subscription = 'subscription',
  Database = 'database',
  Import = 'import',
}

export enum OAuthSocialAction {
  Create = 'create',
  Import = 'import',
  SignIn = 'signIn',
}

export enum OAuthStrategy {
  Google = 'google',
  GitHub = 'github',
  SSO = 'sso',
}

export enum CloudSsoUtmCampaign {
  ListOfDatabases = 'list_of_databases',
  Workbench = 'redisinsight_workbench',
  WelcomeScreen = 'welcome_screen',
  BrowserSearch = 'redisinsight_browser_search',
  BrowserOverview = 'redisinsight_browser_overview',
  BrowserFilter = 'browser_filter',
  Tutorial = 'tutorial',
  AutoDiscovery = 'auto_discovery',
  Copilot = 'copilot',
  UserProfile = 'user_account',
  Settings = 'settings',
  Unknown = 'other',
}

export enum OAuthProvider {
  AWS = 'AWS',
  Azure = 'Azure',
  Google = 'GCP',
}

export const OAuthProviders = [{
  id: OAuthProvider.AWS,
  icon: AWSIcon,
  label: 'Amazon Web Services',
  // className: styles.awsIcon,
}, {
  id: OAuthProvider.Google,
  icon: GoogleIcon,
  label: 'Google Cloud',
}, {
  id: OAuthProvider.Azure,
  icon: AzureIcon,
  label: 'Microsoft Azure',
}]
