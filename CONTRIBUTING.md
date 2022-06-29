# Contributing

Thanks for contributing!

## Installation

```sh
git clone https://github.com/prettier/eslint-plugin-prettier.git
cd eslint-plugin-prettier
yarn
```

## Running the tests

```sh
yarn test
```

This is an [ESLint](http://eslint.org) plugin. Documentation for the APIs that it uses can be found on ESLint's [Working with Plugins](http://eslint.org/docs/developer-guide/working-with-plugins) page.

This plugin is used to lint itself. The style is checked when `yarn test` is run, and the build will fail if there are any linting errors. You can use `yarn lint --fix` to fix some linting errors. To run the tests without running the linter, you can use `yarn mocha`.

## Commit messages

Please view [commitlint](https://commitlint.js.org) for more details.

## Publishing

```sh
yarn release
```

Please view [changesets](https://github.com/changesets/changesets) and its [action](https://github.com/changesets/action) for more details.
