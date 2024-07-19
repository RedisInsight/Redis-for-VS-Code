const whitelist = {
  'linux': {
    'x64': 1,
  },
  'mac': {
    'x64': 1,
    'arm64': 1,
  },
  'windows': {
    'x64': 1,
  },
};

(() => {
  const os = process.argv[2];
  const targets = process.argv[3]?.split(" ") || [];

  if (targets.length) {
    targets.forEach((target) => {
      if (!whitelist[os]?.[target]) {
        throw new Error(`Target ${target} for ${os} is not allowed. \nAllowed targets: ${Object.keys(whitelist[os] || {}).join(',')}`);
      }
    })
  }
})()
