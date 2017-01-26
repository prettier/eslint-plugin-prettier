# eslint-plugin-prettier

Runs [prettier](https://github.com/jlongster/prettier) as an eslint rule

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm install eslint --save-dev
```

Next, install `eslint-plugin-prettier`:

```
$ npm install eslint-plugin-prettier --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-prettier` globally.

## Usage

Add `prettier` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "prettier"
    ]
}
```


Then configure the `prettier` rule under the `rules` section:

```json
{
    "rules": {
        "prettier/prettier": "error"
    }
}
```

You can also pass `prettier` configuration as an option:

```json
{
    "rules": {
        "prettier/prettier": ["error", {"trailingComma": true, "singleQuote": true}]
    }
}
```

The rule will report an error if your code does not match `prettier` style. The rule is autofixable -- if you run `eslint` with the `--fix` flag, your code will be formatted according to `prettier` style.
