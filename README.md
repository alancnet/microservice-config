# microservice-config

Combines the command line, environment variables, a json file, and a default
object into a single deep configuration object.

- If a JSON file argument is passed to the program on the command line, that
 file will be read and combined with the other inputs.

Regardless of the source, it will decode numbers and booleans, including
'yes', 'no', 'on', 'off', 'enabled', and 'disabled'.

The priority is:

1. Command line: `--my.setting=100 --my.otherSetting=200`
2. Environment:  `export my_setting=100; export my_otherSetting=200;`
3. Config file:  `{ "my": { "setting": "100", "otherSetting": "200" }}`
4. Defaults:     `{ my:{ setting: "100", otherSetting: "200" } }`

## Usage

```javascript
import { getConfig } from 'microservice-config'

const config = getConfig({
    host: '0.0.0.0',
    port: 80
})
```
