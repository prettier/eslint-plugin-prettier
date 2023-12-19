---
'eslint-plugin-prettier': minor
---

Add recommended config for the flat config format.

If you are using flat config, import the recommended config from `eslint-plugin-prettier/recommended`. Like the legacy format recommended config, this automatically includes the contents of `eslint-config-prettier`.

```js
// eslint.config.js
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  // Any other config imports go at the top
  eslintPluginPrettierRecommended,
];
```
