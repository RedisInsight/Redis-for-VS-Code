import { CloudSsoUtmCampaign, OAuthSocialSource } from '../cloud/source'

export const EXTERNAL_LINKS = {
  riAppDownload: 'https://redis.io/insight/',
  jsonModule: 'https://redis.io/docs/latest/operate/oss_and_stack/stack-with-enterprise/json/',
  tryFree: 'https://redis.io/try-free/',
  githubRepo: 'https://github.com/RedisInsight/Redis-for-VS-Code/',
  githubIssues: 'https://github.com/RedisInsight/Redis-for-VS-Code/issues/',
  cloudConsole: 'https://cloud.redis.io/#/databases/',
}

export const UTM_CAMPAIGNS = {
  CLI: 'CLI',
  tutorials: 'redisinsight_tutorials',
  redisjson: 'redisinsight_redisjson',
  redisLatest: 'redisinsight_redis_latest',
}

export const UTM_CAMPAINGS: Record<any, string> = {
  [OAuthSocialSource.Tutorials]: 'redisinsight_tutorials',
  [OAuthSocialSource.BrowserSearch]: 'redisinsight_browser_search',
  [OAuthSocialSource.Workbench]: 'redisinsight_workbench',
  [CloudSsoUtmCampaign.BrowserFilter]: 'browser_filter',
  [OAuthSocialSource.EmptyDatabasesList]: 'empty_db_list',
  [OAuthSocialSource.AddDbForm]: 'add_db_form',
  PubSub: 'pub_sub',
  Main: 'main',
}

export const UTM_MEDIUMS = {
  App: 'app',
  Main: 'main',
  Rdi: 'rdi',
  Recommendation: 'recommendation',
}
