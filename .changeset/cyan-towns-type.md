---
"eslint-plugin-prettier": major
---

Remove `@types/eslint` from `peerDependencies` to avoid conflicts with ESLint 9 (types are bundled there).
If you're on ESLint 8 and rely on typings, add `@types/eslint` to your project's `devDependencies`. See #762.
