---
'eslint-plugin-prettier': minor
---

feat: support ESLint flat config system

`eslint-plugin-prettier` can be used in the flat config format like this with CJS:

```js
const prettier = require('eslint-plugin-prettier/flat');

module.exports = [prettier.configs.recommended];
```

Or with ESM:

```js
import prettier from 'eslint-plugin-prettier/flat';

export default [prettier.configs.recommended];
```
