# microservice-config

Combines the command line, environment variables, a json file, and a default
object into a single deep configuration object.

- If a JSON file argument is passed to the program on the command line, that
  file will be read and combined with the other inputs.

The priority is:
1. Command line: --my.setting=100 --my.other-setting=200
2. Environment:  export my.setting=100; export my.otherSetting=200;
3. Config file:  { "my": { "setting": "100", "otherSetting": "200" }}
4. Defaults:     { my:{ setting: "100", otherSetting: "200" } }

A special config key, `config`, may be interpreted differently:
 
- If it ends in `.json`, the value will be interpreted as a path to a JSON file to load.
- If the value is itself a JSON object, it will be parsed and loaded.
 
If supplied, the config json is parsed last, and takes priority top priority
over all other values.

## Usage

```javascript
import { getConfig } from 'microservice-config'

const config = getConfig({
    host: '0.0.0.0',
    port: 80
})
```
