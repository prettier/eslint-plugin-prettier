# Contributing

Thanks for contributing!

## Installation

```sh
git clone https://github.com/prettier/eslint-plugin-prettier.git
cd eslint-plugin-prettier
pnpm install
```

## Running the tests

```sh
pnpm test
```

This is an [ESLint](http://eslint.org) plugin. Documentation for the APIs that it uses can be found on ESLint's [Working with Plugins](http://eslint.org/docs/developer-guide/working-with-plugins) page.

This plugin is used to lint itself. The style is checked when `pnpm test` is run, and the build will fail if there are any linting errors. You can use `pnpm lint --fix` to fix some linting errors. To run the tests without running the linter, you can use `pnpm mocha`.

## Commit messages

Please view [commitlint](https://commitlint.js.org) for more details.

## Publishing

```sh
pnpm release
```

Please view [changesets](https://github.com/changesets/changesets) and its [action](https://github.com/changesets/action) for more details.
