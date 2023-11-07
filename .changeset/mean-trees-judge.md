---
'eslint-plugin-prettier': patch
---

fix: specify `eslint-config-prettier` as peer dependency

It's already added to `peerDependenciesMeta` as optional, which means it should also be specified in `peerDependencies`.
