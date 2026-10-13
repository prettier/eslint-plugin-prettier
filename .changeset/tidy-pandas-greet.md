---
"eslint-plugin-prettier": patch
---

Report a clear error when the sync worker fails to load, so a missing `prettier` dependency now fails fast with `Cannot find package 'prettier'` instead of hanging ESLint indefinitely.
