import subarg from 'subarg'
import fs from 'fs'
import defaultsDeep from 'lodash.defaultsdeep'

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
export function getConfig (defaults) {
  const commandLine = subarg(process.argv.slice(2));
  const configFile = commandLine._.find((x) => /\.json$/.test(x))
  let config = defaultsDeep(
    // Priority 3: config file
    configFile && JSON.parse(fs.readFileSync(configFile)) || {},
    // Priority 4: defaults
    defaults || {}
  );


  // Priority 2: Environment
  const normalizedEnv = Object.fromEntries(Object.entries(process.env).map(([key, value]) => [key.toLowerCase().split('.').join('_'), decode(value)]))

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
  config = defaultsDeep(
    commandLine,
    config
  )

  return JSON.parse(JSON.stringify(config), (key, value) => decode(value))

}

const trueRegex = /^true|on|yes|enable|enabled$/i
const falseRegex = /^false|off|no|disable|disabled$/i
const numberRegex = /^\d+(\.\d+)?(e[-+]\d+)$/i

/**
 * Decodes common string values.
 * 
 * @param {string} value 
 * @returns {string|number|boolean}
 */
export function decode(value) {
  if (typeof value === 'string') {
    if (trueRegex.test(value)) return true
    if (falseRegex.test(value)) return false
    if (numberRegex.test(value)) {
      const float = parseFloat(value)
      if (!isNaN(float)) return float
    }
  }
  return value
}