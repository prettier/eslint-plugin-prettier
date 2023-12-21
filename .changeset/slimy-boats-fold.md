---
'eslint-plugin-prettier': patch
---

Add exports mapping to package.json, to allow `import eslintPluginRecommended from 'eslint-plugin-prettier/recommended'` to work as expected.

Strictly speaking this is a breaking change as it removes the ability for people to import from "eslint-plugin-prettier/eslint-plugin-prettier.js" and "eslint-plugin-prettier/recommended.js" but the former was never recommended in the first place and the latter has only been available for a few days.
