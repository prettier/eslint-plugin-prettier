# eslint-plugin-prettier [![Build Status](https://github.com/prettier/eslint-plugin-prettier/workflows/CI/badge.svg?branch=master)](https://github.com/prettier/eslint-plugin-prettier/actions?query=workflow%3ACI+branch%3Amaster)

Runs [Prettier](https://github.com/prettier/prettier) as an [ESLint](http://eslint.org) rule and reports differences as individual ESLint issues.

If your desired formatting does not match Prettier’s output, you should use a different tool such as [prettier-eslint](https://github.com/prettier/prettier-eslint) instead.

Please read [Integrating with linters](https://prettier.io/docs/en/integrating-with-linters.html) before installing.

## Sample

```js
error: Insert `,` (prettier/prettier) at pkg/commons-atom/ActiveEditorRegistry.js:22:25:
  20 | import {
  21 |   observeActiveEditorsDebounced,
> 22 |   editorChangesDebounced
     |                         ^
  23 | } from './debounced';;
  24 |
  25 | import {observableFromSubscribeFunction} from '../commons-node/event';


error: Delete `;` (prettier/prettier) at pkg/commons-atom/ActiveEditorRegistry.js:23:21:
  21 |   observeActiveEditorsDebounced,
  22 |   editorChangesDebounced
> 23 | } from './debounced';;
     |                     ^
  24 |
  25 | import {observableFromSubscribeFunction} from '../commons-node/event';
  26 | import {cacheWhileSubscribed} from '../commons-node/observable';


2 errors found.
```

> `./node_modules/.bin/eslint --format codeframe pkg/commons-atom/ActiveEditorRegistry.js` (code from [nuclide](https://github.com/facebook/nuclide)).

## Installation

```sh
npm install --save-dev eslint-plugin-prettier
npm install --save-dev --save-exact prettier
```

**_`eslint-plugin-prettier` does not install Prettier or ESLint for you._** _You must install these yourself._

Then, in your `.eslintrc.json`:

```json
{
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

## Recommended Configuration

This plugin works best if you disable all other ESLint rules relating to code formatting, and only enable rules that detect potential bugs. (If another active ESLint rule disagrees with `prettier` about how code should be formatted, it will be impossible to avoid lint errors.) You can use [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) to disable all formatting-related ESLint rules.

This plugin ships with a `plugin:prettier/recommended` config that sets up both the plugin and `eslint-config-prettier` in one go.

1. In addition to the above installation instructions, install `eslint-config-prettier`:

   ```sh
   npm install --save-dev eslint-config-prettier
   ```

2. Then you need to add `plugin:prettier/recommended` as the _last_ extension in your `.eslintrc.json`:

   ```json
   {
     "extends": ["plugin:prettier/recommended"]
   }
   ```

   You can then set Prettier's own options inside a `.prettierrc` file.

## Practical Examples

Below are practical examples of how to use `elsint-plugin-prettier` by itself as well as with with other popular `elslint` and `javascript` libraries.

Before we begin it will be helpful to understand some shorthand syntax of `eslint` with regards to the `extends` array and `plugins` object within the `.eslintrc` file.

For example, consider the following three lines of code:

1. `"extends": ["plugin:prettier"]`
2. `"extends": ["prettier"]`
3. `"plugins": ["prettier"]`

In the first example, `eslint` is extending an eslint **plugin**. It is shorthand for `"extends": ["eslint-plugin-prettier"]`.

In the second example it is extending an eslint **config** package. It is shorthand for `"extends: ["eslint-config-prettier"]`.

In the third example, we are _registering_ an eslint **plugin**. It is shorthand for `"plugins": ["eslint-plugin-prettier"]`.

In other words, a package name within the `extends` property is shorthand for `"extends": ["eslint-config-packagename"]` unless it is prefaced by `plugin:` in which case it is shorthand for `"extends": ["eslint-plugin-packagename"]`.

Similarly, a package name within the `plugins` is shorthand for `"plugins": ["eslint-plugin-packagename"]`

With that said, let's take a look at some examples.

### Just Eslint-Plugin-Prettier

Install the `eslint-plugin-prettier`:

With npm:

```
npm install --save-dev eslint-plugin-prettier
```

With yarn:

```
yarn add --dev eslint-plugin-prettier
```

Setup an eslint configuration file:

```json
// .eslintrc.json

{
  "extends": [],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
}
```

#### How this works

`"plugins": ["prettier"]`. This is shorthand for `eslint-plugin-prettier`. This registers our plugin. Registering the plugin in and of itself does not do anything, but it does enable the plugin to add linting rules in the `rules` property (see below).

` "rules": { ... }`

Here is where we set the linting rules that we want to add to `eslint`:

- `"prettier/prettier": "error"`: turns on the linting rules provided by the `eslint-plugin-prettier` plugin. This effectively runs `prettier` from within `eslint`.

- `"arrow-body-style": "off"`: turns off an `eslint` core rule called `arrow-body-style`. We turn this rule off because of problems it causes with the prettier plugin.

- `"prefer-arrow-callback": "off"`: turns off another `eslint` core rule again because of a problem that it causes with the prettier plugin.

### With Eslint-Config-Prettier

Install the following packages:

- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier)
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)

With npm:

```
npm install --save-dev eslint-plugin-prettier eslint-config-prettier
```

With yarn:

```
yarn add --dev eslint-plugin-prettier eslint-config-prettier
```

Setup an eslint configuration file:

```json
// .eslintrc.json

{
  "extends": ["plugin:prettier/recommended"],
  "plugins": [], // no plugin configuration needed
  "rules": {} // add custom prettier rules here
}
```

#### How this works

`"extends": [ "plugin:prettier/recommended" ]` instructs `eslint` to use the `recommended` settings within the `eslint-plugin-prettier` package. This in effect resets the `.eslintrc.json` as follows:

```json
{
  "extends": ["prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
}
```

This "new" `.eslintrc.json` is simply the same configuration that we showed above in the [Eslint-Plugin-Prettier](#just-eslint-plugin-prettier) example combined with the addition of `"extends": ["prettier"]`

In `"extends": ["prettier"]` we instruct `eslint` to use the `eslint-config-prettier` package. With this package, we turn off a number of `eslint` rules which conflict with `prettier`.

To understand the rest of this config file, see the [Eslint-Plugin-Prettier](#how-this-works) example above.

#### Alternative Method

There is no obligation to use the `"extends": ["plugin:prettier/recommended"]` shorthand form. You can, instead, explicitly write everything out in your `.eslintrc` file as follows:

```json
{
  "extends": ["prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
}
```

This will extend the `eslint-config-prettier` package, register the `eslint-plugin-prettier` file and then add the requisite `eslint-plugin-prettier` rules.

### With Airbnb

Install the following plugins:

- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier)
- [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb)

**NOTE**

- See [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) for instructions on how to properly install `eslint-config-airbnb`.
- [See above](#just-eslint-plugin-prettier) for how to install `eslint-plugin-prettier`

Setup an eslint configuration file:

```json
// .eslintrc.json

{
  "extends": ["airbnb", "airbnb:hooks"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
}
```

#### How This Works

In the above example we first extend the `eslint-config-airbnb` package as well as the `airbnb/hooks` sub-package. We then register the `eslint-plugin-prettier` package and add the requisite `elsint-plugin-prettier` rules.

### With Airbnb and Eslint-Config-Prettier

Install the following plugins:

- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier)
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)
- [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb)

**NOTE**

- See [eslint-config-airbnb](https://www.npmjs.com/package/eslint-config-airbnb) for instructions on how to properly install `eslint-config-airbnb`.
- [See above](#with-eslint-config-prettier) for how to install the `eslint-plugin-prettier` and `eslint-config-prettier` packages

Setup an eslint configuration file. Here is an example `.eslintrc.json` file:

```json
{
  "extends": ["airbnb", "airbnb:hooks", "plugin:prettier/recommended"],
  "plugins": [], // no plugin configuration needed
  "rules": {} // add custom rules here
}
```

#### How this works

`eslint` extends `eslint-config` packages in the order in which they are placed within the `extends` array. In the above example that means that `eslint` will extend the following `eslint-config` packages in the following order:

1. `eslint-config-airbnb`
2. `eslint-config-airbnb/hooks`
3. `eslint-config-prettier`

[Remember: `eslint-config-prettier` automatically gets extended by `plugin:prettier/recommended` as we noted [above](#how-this-works-1)].

This order is important for if there is a conflict between different linting rules set by different `eslint-config` packages, the last package "wins".

As such, it is important to make sure that `plugin:prettier/recommended` is always the last item in the `extends` array so that no other package will override the `prettier` linting rules.

#### Alternative Method

There is no obligation to use the `"extends": ["plugin:prettier/recommended"]` shorthand form. You can, instead, explicitly write everything out in your `.eslintrc` file as follows:

```json
{
  "extends": ["airbnb", "airbnb:hooks", "prettier"],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
}
```

This will extend the `eslint-config-airbnb` and `eslint-config-airbnb/hooks` packages, register the `eslint-plugin-prettier` file and then add the requisite `eslint-plugin-prettier` rules.

**NOTE**

We still need to include `prettier` at the end of the `extends` array to ensure that the `eslint-config-prettier` package overrides any conflicting rules within the `eslint-config-airbnb` or `eslint-config-airbnb/hooks` linting rules

### With React and Eslint-Config-Prettier

Install the following packages:

- [eslint-plugin-prettier](https://www.npmjs.com/package/eslint-plugin-prettier)
- [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)
- [eslint-plugin-react](https://www.npmjs.com/package/eslint-plugin-react)
- [eslint-plugin-react-hooks](https://www.npmjs.com/package/eslint-plugin-react-hooks)

**NOTE**

Some packages like `eslint-config-airbnb` automatically install the `eslint-plugin-react` and `eslint-plugin-react-hooks` packages

With npm:

```
npm install --save-dev eslint-plugin-prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
```

With yarn:

```
yarn add --dev eslint-plugin-prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks
```

Setup an eslint configuration file:

```json
// .eslintrc.json

{
  "extends": [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:prettier/recommended"
  ],
  "plugins": [],
  "rules": {}
}
```

#### How this works

As always, we make sure that to add `"plugin:prettier/recommended"` last in the `extends` array. We do not need to add any other subpackages of `eslint-plugin-prettier`.

#### Alternative Method

There is no obligation to use the `"extends": ["plugin:prettier/recommended"]` shorthand form. You can, instead, explicitly write everything out in your `.eslintrc` file as follows:

```json
{
  "extends": [
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error",
    "arrow-body-style": "off",
    "prefer-arrow-callback": "off"
  }
}
```

The key point (as always) is to make sure that the `prettier` package comes last in the `extends` array.

## `arrow-body-style` and `prefer-arrow-callback` issue

If you use [arrow-body-style](https://eslint.org/docs/rules/arrow-body-style) or [prefer-arrow-callback](https://eslint.org/docs/rules/prefer-arrow-callback) together with the `prettier/prettier` rule from this plugin, you can in some cases end up with invalid code due to a bug in ESLint’s autofix – see [issue #65](https://github.com/prettier/eslint-plugin-prettier/issues/65).

For this reason, it’s recommended to turn off these rules. The `plugin:prettier/recommended` config does that for you.

You _can_ still use these rules together with this plugin if you want, because the bug does not occur _all the time._ But if you do, you need to keep in mind that you might end up with invalid code, where you manually have to insert a missing closing parenthesis to get going again.

If you’re fixing large of amounts of previously unformatted code, consider temporarily disabling the `prettier/prettier` rule and running `eslint --fix` and `prettier --write` separately.

## Options

> Note: While it is possible to pass options to Prettier via your ESLint configuration file, it is not recommended because editor extensions such as `prettier-atom` and `prettier-vscode` **will** read [`.prettierrc`](https://prettier.io/docs/en/configuration.html), but **won't** read settings from ESLint, which can lead to an inconsistent experience.

- The first option:

  - An object representing [options](https://prettier.io/docs/en/options.html) that will be passed into prettier. Example:

    ```json
    "prettier/prettier": ["error", {"singleQuote": true, "parser": "flow"}]
    ```

    NB: This option will merge and override any config set with `.prettierrc` files

- The second option:

  - An object with the following options

    - `usePrettierrc`: Enables loading of the Prettier configuration file, (default: `true`). May be useful if you are using multiple tools that conflict with each other, or do not wish to mix your ESLint settings with your Prettier configuration.

      ```json
      "prettier/prettier": ["error", {}, {
        "usePrettierrc": false
      }]
      ```

    - `fileInfoOptions`: Options that are passed to [prettier.getFileInfo](https://prettier.io/docs/en/api.html#prettiergetfileinfofilepath--options) to decide whether a file needs to be formatted. Can be used for example to opt-out from ignoring files located in `node_modules` directories.

      ```json
      "prettier/prettier": ["error", {}, {
        "fileInfoOptions": {
          "withNodeModules": true
        }
      }]
      ```

- The rule is autofixable -- if you run `eslint` with the `--fix` flag, your code will be formatted according to `prettier` style.

---

## Contributing

See [CONTRIBUTING.md](https://github.com/prettier/eslint-plugin-prettier/blob/master/CONTRIBUTING.md)
