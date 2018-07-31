# Contributing

Thanks for contributing!

## Installation

```bash
git clone https://github.com/prettier/eslint-plugin-prettier.git
cd eslint-plugin-prettier
yarn # or `npm install`
```

## Running the tests

```bash
npm test
```

This is an [ESLint](http://eslint.org) plugin. Documentation for the APIs that it uses can be found on ESLint's [Working with Plugins](http://eslint.org/docs/developer-guide/working-with-plugins) page.

This plugin is used to lint itself. The style is checked when `npm test` is run, and the build will fail if there are any linting errors. You can use `npm run lint -- --fix` to fix some linting errors. To run the tests without running the linter, you can use `node_modules/.bin/mocha`.

## Commit messages

Commit messages should start with one of the following prefixes: `Breaking:`, `New:`, `Update:`, `Fix:`, `Docs:`, `Build:`, `Upgrade:`, `Chore:`. These prefixes are automatically used to determine the release type when generating a release, as described [here](https://github.com/not-an-aardvark/node-release-script/tree/5f5ed3fdfbb584f2e940daab1e2ad948b186410a#what-does-it-do).

## Publishing

```bash
npm run generate-release
git push --follow-tags
npm publish
```

`npm run generate-release` will autogenerate a commit, changelog entry, and git tag like https://github.com/prettier/eslint-plugin-prettier/commit/56873bf2.
