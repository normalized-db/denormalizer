# @normalized-db/denormalizer

Denormalize `JavaScript` objects from a normalized data structure based on a simple schema 
(implemented with `TypeScript`).

 - **Author**: Sandro Schmid ([saseb.schmid@gmail.com](<mailto:saseb.schmid@gmail.com>))
 - **Version**: 2.5.0-beta.3

## Versioning

To ease versioning equal major and minor version numbers are used for all modules.

## Installation

Install using NPM:

    npm install --save @normalized-db/denormalizer

## Usage

Use the `DenormalizerBuilder` to create a `Denormalizer`. Use either `schema(…)` or `schemaConfig(…)` to apply a 
schema configuration. This is the only required parameter. If `normalizedData` does not contain an object which is
needed during denormalization then the `Denormalizer` will try to lazy load it using `fetchCallback`. The `KeyMap`
is a helper with a mapping from primary keys to the index of the related object in the normalized data.

To actually denormalize an object or an array of objects use either…

 - `applyAll(…): Promise<T[]>` for objects of a given type
 - `applyAllKeys(…): Promise<T[]>` for objects with keys of a given type
 - `apply(…): Promise<T>` for single objects of a given type
 - `applyKey(…): Promise<T>` for single objects by a key of a given type
 
The `type`-argument defines the data-store in which the item should be contained. Using a `depth` you can define
how far the denormalization should be applied. A number means that all targets should be denormalized to the n-th level.
`null` means that the field should be denormalized as far as possible. Note that circular dependencies currently will
not be detected. If you need different levels for various fields then use a `Depth`-object like 
e.g. `{ foo: 3, bar: { x: 1, y: null }`. This would denormalize up to 3 levels on obj.foo, 1 level on obj.bar.x and
everything on obj.bar.y.

## Examples

See the [examples-project](https://github.com/normalized-db/examples) for detailed examples:

 - [Angular4-App](https://github.com/normalized-db/examples/tree/master/angular-demo)
