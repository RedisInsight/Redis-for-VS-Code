import { DATABASE_LIST_MODULES_TEXT, RedisDefaultModules } from 'uiSrc/interfaces'
import RedisAI from 'uiSrc/assets/modules/RedisAI.svg'
import RedisBloom from 'uiSrc/assets/modules/RedisBloom.svg'
import RedisGears from 'uiSrc/assets/modules/RedisGears.svg'
import RedisGraph from 'uiSrc/assets/modules/RedisGraph.svg'
import RedisGears2 from 'uiSrc/assets/modules/RedisGears2.svg'
import RedisJSON from 'uiSrc/assets/modules/RedisJSON.svg'
import RedisTimeSeries from 'uiSrc/assets/modules/RedisTimeSeries.svg'
import RedisSearch from 'uiSrc/assets/modules/RedisSearch.svg'

const rediSearchIcons = {
  icon: RedisSearch,
}

export const DEFAULT_MODULES_INFO = {
  [RedisDefaultModules.AI]: {
    icon: RedisAI,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.AI],
  },
  [RedisDefaultModules.Bloom]: {
    icon: RedisBloom,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Bloom],
  },
  [RedisDefaultModules.Gears]: {
    icon: RedisGears,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Gears],
  },
  [RedisDefaultModules.Graph]: {
    icon: RedisGraph,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Graph],
  },
  [RedisDefaultModules.RedisGears]: {
    icon: RedisGears,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.RedisGears],
  },
  [RedisDefaultModules.RedisGears2]: {
    icon: RedisGears2,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.RedisGears2],
  },
  [RedisDefaultModules.ReJSON]: {
    icon: RedisJSON,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.ReJSON],
  },
  [RedisDefaultModules.Search]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.Search],
  },
  [RedisDefaultModules.SearchLight]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.SearchLight],
  },
  [RedisDefaultModules.FT]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.FT],
  },
  [RedisDefaultModules.FTL]: {
    ...rediSearchIcons,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.FTL],
  },
  [RedisDefaultModules.TimeSeries]: {
    icon: RedisTimeSeries,
    text: DATABASE_LIST_MODULES_TEXT[RedisDefaultModules.TimeSeries],
  },
}
