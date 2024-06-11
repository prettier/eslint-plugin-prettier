# eslint-plugin-prettier

Este archivo contiene la documentación para el paquete eslint-plugin-prettier. Incluye información sobre el paquete, su estado de construcción y un enlace al flujo de trabajo de CI en GitHub.

## TOC <!-- omit in toc -->

- [Muestra](#muestra)
- [Instalación](#instalación)
- [Configuración (legacy: `.eslintrc*`)](#configuración-legacy-eslintrc)
- [Configuración (nueva: `eslint.config.js`)](#configuración-nueva-eslintconfigjs)
- [Soporte para `Svelte`](#soporte-para-svelte)
- [Problema con `arrow-body-style` y `prefer-arrow-callback`](#problema-con-arrow-body-style-y-prefer-arrow-callback)
- [Opciones](#opciones)
- [Patrocinadores](#patrocinadores)
- [Colaboradores](#colaboradores)
- [Contribuir](#contribuir)
- [Registro de cambios](#registro-de-cambios)
- [Licencia](#licencia)

## Muestra
/**
 * @file README.md
 * @description This file contains the documentation for the eslint-plugin-prettier package.
 * It includes information about the package, its build status, and a link to the CI workflow on GitHub.
 */
/**
 * @file README.md
 * @description This file contains the documentation for the eslint-plugin-prettier package.
 * It includes information about the package, its build status, and a link to the CI workflow on GitHub.
 */
# eslint-plugin-prettier [![Build Status](https://github.com/prettier/eslint-plugin-prettier/workflows/CI/badge.svg?branch=master)](https://github.com/prettier/eslint-plugin-prettier/actions?query=workflow%3ACI+branch%3Amaster)

Runs [Prettier](https://github.com/prettier/prettier) as an [ESLint](https://eslint.org) rule and reports differences as individual ESLint issues.

If your desired formatting does not match Prettier’s output, you should use a different tool such as [prettier-eslint](https://github.com/prettier/prettier-eslint) instead.

Please read [Integrating with linters](https://prettier.io/docs/en/integrating-with-linters.html) before installing.

## TOC <!-- omit in toc -->

- [Sample](#sample)
- [Installation](#installation)
- [Configuration (legacy: `.eslintrc*`)](#configuration-legacy-eslintrc)
- [Configuration (new: `eslint.config.js`)](#configuration-new-eslintconfigjs)
- [`Svelte` support](#svelte-support)
- [`arrow-body-style` and `prefer-arrow-callback` issue](#arrow-body-style-and-prefer-arrow-callback-issue)
- [Options](#options)
- [Sponsors](#sponsors)
- [Backers](#backers)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

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
npm install --save-dev eslint-plugin-prettier eslint-config-prettier
npm install --save-dev --save-exact prettier
```

**_`eslint-plugin-prettier` does not install Prettier or ESLint for you._** _You must install these yourself._

This plugin works best if you disable all other ESLint rules relating to code formatting, and only enable rules that detect potential bugs. If another active ESLint rule disagrees with `prettier` about how code should be formatted, it will be impossible to avoid lint errors. Our recommended configuration automatically enables [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) to disable all formatting-related ESLint rules.

## Configuration (legacy: `.eslintrc*`)

For [legacy configuration](https://eslint.org/docs/latest/use/configure/configuration-files), this plugin ships with a `plugin:prettier/recommended` config that sets up both `eslint-plugin-prettier` and [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) in one go.

Add `plugin:prettier/recommended` as the _last_ item in the extends array in your `.eslintrc*` config file, so that `eslint-config-prettier` has the opportunity to override other configs:

```json
{
  "extends": ["plugin:prettier/recommended"]
}
```

This will:

- Enable the `prettier/prettier` rule.
- Disable the `arrow-body-style` and `prefer-arrow-callback` rules which are problematic with this plugin - see the below for why.
- Enable the `eslint-config-prettier` config which will turn off ESLint rules that conflict with Prettier.

## Configuration (new: `eslint.config.js`)

For [flat configuration](https://eslint.org/docs/latest/use/configure/configuration-files-new), this plugin ships with an `eslint-plugin-prettier/recommended` config that sets up both `eslint-plugin-prettier` and [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier) in one go.

Import `eslint-plugin-prettier/recommended` and add it as the _last_ item in the configuration array in your `eslint.config.js` file so that `eslint-config-prettier` has the opportunity to override other configs:

```js
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = [
  // Any other config imports go at the top
  eslintPluginPrettierRecommended,
];
```

This will:

- Enable the `prettier/prettier` rule.
- Disable the `arrow-body-style` and `prefer-arrow-callback` rules which are problematic with this plugin - see the below for why.
- Enable the `eslint-config-prettier` config which will turn off ESLint rules that conflict with Prettier.

## `Svelte` support

We recommend using [`eslint-plugin-svelte`](https://github.com/ota-meshi/eslint-plugin-svelte) instead of [`eslint-plugin-svelte3`](https://github.com/sveltejs/eslint-plugin-svelte3) because `eslint-plugin-svelte` has a correct [`eslint-svelte-parser`](https://github.com/ota-meshi/svelte-eslint-parser) instead of hacking.

When used with `eslint-plugin-svelte3`, `eslint-plugin-prettier` will just ignore the text passed by `eslint-plugin-svelte3`, because the text has been modified.

If you still decide to use `eslint-plugin-svelte3`, you'll need to run `prettier --write *.svelte` manually.

## `arrow-body-style` and `prefer-arrow-callback` issue

If you use [arrow-body-style](https://eslint.org/docs/rules/arrow-body-style) or [prefer-arrow-callback](https://eslint.org/docs/rules/prefer-arrow-callback) together with the `prettier/prettier` rule from this plugin, you can in some cases end up with invalid code due to a bug in ESLint’s autofix – see [issue #65](https://github.com/prettier/eslint-plugin-prettier/issues/65).

For this reason, it’s recommended to turn off these rules. The `plugin:prettier/recommended` config does that for you.

You _can_ still use these rules together with this plugin if you want, because the bug does not occur _all the time._ But if you do, you need to keep in mind that you might end up with invalid code, where you manually have to insert a missing closing parenthesis to get going again.

If you’re fixing large amounts of previously unformatted code, consider temporarily disabling the `prettier/prettier` rule and running `eslint --fix` and `prettier --write` separately.

## Options

> Note: While it is possible to pass options to Prettier via your ESLint configuration file, it is not recommended because editor extensions such as `prettier-atom` and `prettier-vscode` **will** read [`.prettierrc`](https://prettier.io/docs/en/configuration.html), but **won't** read settings from ESLint, which can lead to an inconsistent experience.

- The first option:

  - An object representing [options](https://prettier.io/docs/en/options.html) that will be passed into prettier. Example:

    ```json
    {
      "prettier/prettier": [
        "error",
        {
          "singleQuote": true,
          "parser": "flow"
        }
      /**
      ```js
      const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
      module.exports = [
        // Any other config imports go at the top
        eslintPluginPrettierRecommended,
      ];
      ```
      Esto hará lo siguiente:
      - Habilitará la regla `prettier/prettier`.
      - Deshabilitará las reglas `arrow-body-style` y `prefer-arrow-callback` que son problemáticas con este complemento, consulta a continuación el motivo.
      - Habilitará la configuración `eslint-config-prettier` que desactivará las reglas de ESLint que entran en conflicto con Prettier.
      ## Soporte para `Svelte`
      Recomendamos usar [`eslint-plugin-svelte`](https://github.com/ota-meshi/eslint-plugin-svelte) en lugar de [`eslint-plugin-svelte3`](https://github.com/sveltejs/eslint-plugin-svelte3) porque `eslint-plugin-svelte` tiene un correcto [`eslint-svelte-parser`](https://github.com/ota-meshi/svelte-eslint-parser) en lugar de hacer trucos.
      Cuando se utiliza con `eslint-plugin-svelte3`, `eslint-plugin-prettier` simplemente ignorará el texto pasado por `eslint-plugin-svelte3`, ya que el texto ha sido modificado.
      Si aún decides usar `eslint-plugin-svelte3`, deberás ejecutar `prettier --write *.svelte` manualmente.
      ## Problema con `arrow-body-style` y `prefer-arrow-callback`
      Si utilizas [arrow-body-style](https://eslint.org/docs/rules/arrow-body-style) o [prefer-arrow-callback](https://eslint.org/docs/rules/prefer-arrow-callback) junto con la regla `prettier/prettier` de este complemento, en algunos casos puedes obtener código no válido debido a un error en la autocorrección de ESLint, consulta [issue #65](https://github.com/prettier/eslint-plugin-prettier/issues/65).
      Por esta razón, se recomienda desactivar estas reglas. La configuración `plugin:prettier/recommended` lo hace por ti.
      Aún puedes usar estas reglas junto con este complemento si lo deseas, porque el error no ocurre _siempre_. Pero si lo haces, debes tener en cuenta que puedes obtener código no válido, donde tendrás que insertar manualmente un paréntesis de cierre faltante para continuar.
      Si estás corrigiendo grandes cantidades de código no formateado previamente, considera desactivar temporalmente la regla `prettier/prettier` y ejecutar `eslint --fix` y `prettier --write` por separado.
      ## Opciones
      > Nota: Si bien es posible pasar opciones a Prettier a través del archivo de configuración de ESLint, no se recomienda porque las extensiones del editor como `prettier-atom` y `prettier-vscode` **leerán** [`.prettierrc`](https://prettier.io/docs/en/configuration.html), pero **no leerán** las configuraciones de ESLint, lo que puede generar una experiencia inconsistente.
      - La primera opción:


            "prettier/prettier": [
              "error",
              {
                "singleQuote": true,
                "parser": "flow"
              }
