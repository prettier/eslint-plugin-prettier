# Contributing

Thanks for contributing!

## Installation

```bash
git clone https://github.com/not-an-aardvark/eslint-plugin-prettier.git
cd eslint-plugin-prettier
npm install
```

## Running the tests

```bash
npm test
```

This is an [ESLint](http://eslint.org) plugin. Documentation for the APIs that it uses can be found on ESLint's [Working with Plugins](http://eslint.org/docs/developer-guide/working-with-plugins) page.

This plugin is used to lint itself. The style is checked when `npm test` is run, and the build will fail if there are any linting errors. You can use `npm run lint -- --fix` to fix some linting errors. To run the tests without running the linter, you can use `node_modules/.bin/mocha tests --recursive`.
