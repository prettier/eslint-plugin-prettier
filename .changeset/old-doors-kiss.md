---
'eslint-plugin-prettier': minor
---

Add recommended config for the flat config format.

If you are using flat config, import the recommended config from `eslint-plugin-prettier/recommended`. Note that in contrast to the legacy recommended config, the flat recommended config does not add `eslint-config-prettier` automatically, consumers will need to explictly add that themselves.

```js
// eslint.config.js
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  // Any other config imports go at the top
  eslintPluginPrettierRecommended,
  eslintConfigPrettier,
];
```
