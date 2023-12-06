export enum KeyTypesTexts {
    Hash = 'Hash',
    List = 'List',
    Set = 'Set',
    ZSet = 'Sorted Set',
    String = 'String',
    ReJSON = 'JSON',
    Stream = 'Stream',
    Graph = 'Graph',
    TimeSeries = 'TS',
}
export const keyLength = 50;

export const COMMANDS_TO_CREATE_KEY = Object.freeze({
    [KeyTypesTexts.Hash]: (key: string, value: string | number = 'value', field: string | number = 'field') => `HSET ${key} '${field}' '${value}'`,
    [KeyTypesTexts.List]: (key: string, element: string | number = 'element') => `LPUSH ${key} '${element}'`,
    [KeyTypesTexts.Set]: (key: string, member = 'member') => `SADD ${key} '${member}'`,
    [KeyTypesTexts.ZSet]: (key: string, member = 'member', score = 1) => `ZADD ${key} ${score} '${member}'`,
    [KeyTypesTexts.String]: (key: string, value = 'val') => `SET ${key} '${value}'`,
    [KeyTypesTexts.ReJSON]: (key: string, json = '"val"') => `JSON.SET ${key} . '${json}'`,
    [KeyTypesTexts.Stream]: (key: string, value: string | number = 'value', field: string | number = 'field') => `XADD ${key} * '${field}' '${value}'`,
    [KeyTypesTexts.Graph]: (key: string) => `GRAPH.QUERY ${key} "CREATE ()"`,
    [KeyTypesTexts.TimeSeries]: (key: string) => `TS.CREATE ${key}`
});

export enum rte {
    none = 'none',
    standalone = 'standalone',
    sentinel = 'sentinel',
    ossCluster = 'oss-cluster',
    reCluster = 're-cluster',
    reCloud = 're-cloud'
}

export enum env {
    web = 'web',
    desktop = 'desktop'
}

export enum RecommendationIds {
    redisVersion = 'redisVersion',
    searchVisualization = 'searchVisualization',
    setPassword = 'setPassword',
    optimizeTimeSeries = 'RTS',
    luaScript = 'luaScript',
    useSmallerKeys = 'useSmallerKeys',
    avoidLogicalDatabases = 'avoidLogicalDatabases',
    searchJson = 'searchJSON',
}

export enum LibrariesSections {
    Functions = 'Functions',
    KeyspaceTriggers = 'Keyspace',
    ClusterFunctions = 'Cluster',
    StreamFunctions= 'Stream',
}

export enum FunctionsSections {
    General = 'General',
    Flag = 'Flag',
}

export enum MonacoEditorInputs {
    //add library fields
    Code = 'code-value',
    Configuration = 'configuration-value',
    // added library fields
    Library = 'library-code',
    LibraryConfiguration = 'library-configuration',
}

export enum ResourcePath {
    Databases = '/databases',
    RedisSentinel = '/redis-sentinel',
    ClusterDetails = '/cluster-details',
    SyncFeatures = '/features/sync',
}
