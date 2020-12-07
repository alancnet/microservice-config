const subarg = require('subarg');
const envObj = require('env-obj');
const fs = require('fs');
const _ = require('lodash');

/**
  * Combines the command line, environment variables, a json file, and a default
  * object into a single deep configuration object.
  *
  * - If a JSON file argument is passed to the program on the command line, that
  *   file will be read and combined with the other inputs.
  *
  * The priority is:
  * 1. Command line: --my.setting=100 --my.other-setting=200
  * 2. Environment:  export my.setting=100; export my.otherSetting=200;
  * 3. Config file:  { "my": { "setting": "100", "otherSetting": "200" }}
  * 4. Defaults:     { my:{ setting: "100", otherSetting: "200" } }
  *
  * In addition, adds a .get(key) function to the main object.
  * Example: o.get('my.setting') => "100"
  *
  * @template T
  * @param {T} defaults
  * @returns {T}
*/
const getConfig = (defaults) => {
  const commandLine = subarg(process.argv.slice(2));
  const configFile = commandLine._.find((x) => /\.json$/.test(x));
  let config = _.defaultsDeep(
    // Ability to read deeply and safely
    {
      get: function(key) { return readObj(this, key); }
    },
    // Priority 3: config file
    configFile && JSON.parse(fs.readFileSync(configFile)) || {},
    // Priority 4: defaults
    defaults || {}
  );


  // Priority 2: Environment
  const normalizedEnv = Object.fromEntries(Object.entries(process.env).map(([key, value]) => [key.toLowerCase().split('.').join('_'), value]))

  const fixObj = (obj, prefix = '') => {
    if (typeof obj !== 'object') return
    for (const key in obj) {
      const normalizedKey = `${prefix}${key.toLowerCase()}`
      if (normalizedEnv[normalizedKey]) {
        obj[key] = normalizedEnv[normalizedKey]
      }
      fixObj(obj[key], `${normalizedKey}_`)
    }
  }

  fixObj(config)

  // Priority 1: Command line
  config = _.defaultsDeep(
    commandLine,
    config
  )

  return config

};

module.exports = getConfig;
