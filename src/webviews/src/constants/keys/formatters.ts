export enum KeyValueFormat {
  Unicode = 'Unicode',
  ASCII = 'ASCII',
  JSON = 'JSON',
  HEX = 'HEX',
  Binary = 'Binary',
  Msgpack = 'Msgpack',
  PHP = 'PHP serialized',
  JAVA = 'Java serialized',
  Protobuf = 'Protobuf',
  Pickle = 'Pickle',
  Vector32Bit = 'Vector 32-bit',
  Vector64Bit = 'Vector 64-bit',
}

export enum KeyValueCompressor {
  GZIP = 'GZIP',
  ZSTD = 'ZSTD',
  LZ4 = 'LZ4',
  SNAPPY = 'SNAPPY',
  Brotli = 'Brotli',
  PHPGZCompress = 'PHPGZCompress',
}

export const DEFAULT_VIEW_FORMAT = KeyValueFormat.Unicode
