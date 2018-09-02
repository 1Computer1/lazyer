# Lazyer

Lazy iteration in JavaScript.  
Based heavily on the [Rust iterator trait](https://doc.rust-lang.org/std/iter/trait.Iterator.html).  

### Overview

Lazyer allows for lazy iteration.  
It can be used for working with finite sequences:  

```js
const lazy = require('lazyer');
lazy.from(people)
    .filter(person => person.age >= 65)
    .map(person => `${person.firstName} ${person.lastName}`)
    .map(name => name.toUpperCase())
    .forEach(name => console.log(name));
```

And infinite sequences:  

```js
const lazy = require('lazyer');

lazy.range(0, Infinity)
    .scan(([a, b]) => [b, a + b], [0, 1])
    .map(([a]) => a)
    .take(10)
    .collect()
→ [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
```

Works with anything iterable:  

```js
const lazy = require('lazyer');
const string = 'Hello World!';
const set = new Set(string);

lazy.range(0)
    .zip(set)
    .collectMap()
→ Map {
    0 => 'H',
    1 => 'e',
    2 => 'l',
    3 => 'o',
    4 => ' ',
    5 => 'W',
    6 => 'r',
    7 => 'd',
    8 => '!'
}
```

And does a bunch of useful things:  

```js
const lazy = require('lazyer');
const longest = lazy.from(listOfListOfNodes)
    .flat()
    .flatMap(node => node.children)
    .max(node => node.data.length);
```

### Functions

Functions that create a lazy iterator.  

- `from`
- `of`
- `range` 
- `repeat`
- `repeatWith`
- `iterate`

### Adaptors

Methods that adapt the iterator.  
A consumer needs to be called before any of these will be executed.  

- `stepBy`
- `skip`
- `take`
- `skipWhile`
- `takeWhile`
- `chunk`
- `enumerate`
- `concat`
- `cycle`
- `map`
- `filter`
- `scan`
- `zip`
- `flat`
- `flatMap`
- `join`
- `joinWith`
- `each`

### Consumers

Methods that consume the iterator.  
These methods start the iteration.  

- `next`
- `peek`
- `at`
- `count`
- `last`
- `forEach`
- `reduce`
- `sum`
- `product`
- `find`
- `findIndex`
- `includes`
- `every`
- `some`
- `max`
- `min`
- `maxBy`
- `minBy`
- `collect`
- `partition`
- `unzip`
- `group`
- `categorize`
- `clone`
- `cloneMany`

### Docs

See the [documented source code](./src/LazyIterator.js).  
And for examples, see the [test file](./test/index.js).  
