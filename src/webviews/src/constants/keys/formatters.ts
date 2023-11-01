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
}

export enum KeyValueCompressor {
  GZIP = 'GZIP',
  ZSTD = 'ZSTD',
  LZ4 = 'LZ4',
  SNAPPY = 'SNAPPY',
  Brotli = 'Brotli',
  PHPGZCompress = 'PHPGZCompress',
}
