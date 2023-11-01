export const convertBulkStringsToObject = (
  info: string,
  entitiesSeparator = '\r\n',
  KVSeparator = ':',
): any => {
  const entities = info.split(entitiesSeparator)
  try {
    const obj: any = {}
    entities.forEach((line: string) => {
      if (line && line.split) {
        const keyValuePair = line.split(KVSeparator)
        if (keyValuePair.length > 1) {
          const key = keyValuePair.shift()
          if (key !== undefined) {
            obj[key] = keyValuePair.join(KVSeparator)
          }
        }
      }
    })
    return obj
  } catch (e) {
    return {}
  }
}

export const convertRedisInfoReplyToObject = (info: string): any => {
  try {
    const result: any = {}
    const sections = info.match(/(?<=#\s+).*?(?=[\n,\r])/g)
    const values = info.split(/#.*?[\n,\r]/g)
    values.shift()
    sections?.forEach((section: string, index: number) => {
      result[section.toLowerCase()] = convertBulkStringsToObject(
        values[index].trim(),
      )
    })
    return result
  } catch (e) {
    return {}
  }
}
