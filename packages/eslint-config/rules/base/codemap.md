# packages/eslint-config/rules/base/

## Responsibility

This directory is the lowest abstraction layer in the ESLint configuration hierarchy. It
collects ESLint built-in rules under the six official rule-category groupings used by this
configuration: `best-practices`, `es6`, `possible-errors`, `strict`, `style`, and
`variables`. These are core ESLint rules, not rules supplied by framework or third-party
plugins. Higher layers build on these reusable rule buckets.

The categories cover:

- `best-practices`: correctness-oriented conventions and patterns, such as safe control
  flow, equality, prohibited constructs, coercion, and unnecessary operations.
- `es6`: ECMAScript 2015 syntax and usage, including classes, modules, arrows, generators,
  destructuring, `const`/`let`, rest/spread, and template literals.
- `possible-errors`: constructs that can indicate parser-detectable bugs or runtime
  hazards, including invalid regular expressions, duplicate keys, unreachable code,
  unsafe control flow, and invalid `typeof` usage.
- `strict`: strict-mode policy. This bucket currently disables the built-in `strict` rule.
- `style`: source-format and layout conventions, including whitespace, punctuation,
  indentation, line breaks, quotes, semicolons, naming, and operator formatting.
- `variables`: variable binding and scope checks, including undefined, unused, shadowed,
  restricted, and use-before-definition identifiers. It also declares the supported
  browser, ES6, test-runner, jQuery, and Node environments.

## Design

Each JavaScript file corresponds to one official ESLint built-in rule category and exports
one CommonJS configuration object with a `rules` map. The map is a structured re-export of
ESLint's official rule groupings rather than a new rule engine or abstraction. Individual
entries may preserve ESLint defaults, disable a rule, or apply project-specific severity
and option overrides (`error`, `warn`, or `off`). `variables.js` additionally exports its
`env` map alongside the same rule-map structure.

The files use a consistent declarative shape: rule names are keys and ESLint severity/
option tuples are values. Comments record intent and, where relevant, why a rule is
unessential, deferred to a plugin, or intentionally left disabled. No plugin rule is
implemented in this directory; plugin-specific rules are layered elsewhere.

## Flow

The package-level `index.js` composes these buckets bottom-up with `extends`, resolving:
`./rules/base/best-practices`, `possible-errors`, `style`, `variables`, `es6`, and
`strict` before adding the imports layer. From the upper `rules/` perspective, these are
the `./base/<category>` extensions consumed by the package entry configuration.

The effective configuration is assembled in stages:

1. Base: load the six built-in category objects and their severity/options.
2. Framework-specific: extend the base entry and add React, Vue, Node, or other plugin
   rules (for example, `react.js` extends `./index` and `./rules/react`).
3. Essential: extend the appropriate base/framework configuration and apply essential
   severity normalization and blacklists.
4. Entry: expose the selected package configuration to ESLint; later extended configs
   override earlier rule settings according to ESLint config-merge semantics.

## Integration

The direct integration point is `../index.js` (the package-level `index.js`), which extends
all six files by path. Framework entry points reuse that base through the shared index,
while `essential/` builds stricter, curated variants on top of it. The sibling `es5.js`
entry reuses the applicable base buckets and overrides ES5-specific behavior.

This directory mirrors ESLint's official rule-category taxonomy, providing a stable core
that remains independent of `eslint-plugin-react`, Vue, TypeScript, imports, and other
plugin rule namespaces. Changes here therefore affect every configuration entry that
inherits the shared base.
