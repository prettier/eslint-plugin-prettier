---
'eslint-plugin-prettier': minor
---

feat: support ESLint flat config system

`eslint-plugin-prettier` can be used in the flat config format like this with CJS:

```js
const prettier = require('eslint-plugin-prettier');

module.exports = [prettier.configs['recommended-flat']];
```

Or with ESM:

```js
import prettier from 'eslint-plugin-prettier';

export default [prettier.configs['recommended-flat']];
```
