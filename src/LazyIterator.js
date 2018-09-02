/**
 * Class for lazy iteration.
 * Wraps around an iterator.
 * @class
 */
class LazyIterator {
    /**
     * Wraps a lazy iterator around an iterator.
     * @param {Iterator} iterator Object that implements JavaScript's iterator protocol.
     */
    constructor(iterator) {
        this.iterator = iterator;
        this.peeked = false;
        this.peekedAt = null;
    }

    [Symbol.iterator]() {
        return this;
    }

    /**
     * Returns the next item in the iterator.
     * @returns {IteratorResult} Iterator item.
     */
    next() {
        if (this.peeked) {
            this.peeked = false;
            return this.peekedAt;
        }

        return this.iterator.next();
    }

    /**
     * Peeks at the next item in the iterator.
     * @returns {IteratorResult} Iterator item.
     */
    peek() {
        if (this.peeked) {
            return this.peekedAt;
        }

        this.peeked = true;
        this.peekedAt = this.iterator.next();
        return this.peekedAt;
    }

    /**
     * Returns the value at a certain position.
     * This consumes the iterator until the given position.
     * @param {number} index Position of value.
     * @returns {any} The value at the given position.
     */
    at(index) {
        let value;
        for (let i = 0; i <= index; i++) {
            const item = this.next();
            if (item.done) {
                return undefined;
            }

            value = item.value;
        }

        return value;
    }

    /**
     * Returns the size of the iterator.
     * This consumes the iterator.
     * @returns {number} Size of the iterator.
     */
    count() {
        let i = 0;
        // eslint-disable-next-line no-unused-vars
        for (const value of this) {
            i++;
        }

        return i;
    }

    /**
     * Returns the last item of the iterator.
     * This consumes the iterator.
     * @returns {any} Last item of the iterator.
     */
    last() {
        let val;
        for (const value of this) {
            val = value;
        }

        return val;
    }

    /**
     * Returns an iterator that steps in an interval.
     * The iterator starts at the first element.
     * @param {number} stepSize Interval to step by.
     * @returns {StepIterator} The iterator.
     */
    stepBy(stepSize) {
        return new StepIterator(this, stepSize);
    }

    /**
     * Returns an iterator that skips some amount of elements.
     * @param {number} skipAmount Amount of elements to skip.
     * @returns {SkipIterator} The iterator.
     */
    skip(skipAmount) {
        return new SkipIterator(this, skipAmount);
    }

    /**
     * Returns an iterator that takes only some amount of elements.
     * @param {number} takeAmount Amount of elements to take.
     * @returns {TakeIterator} The iterator.
     */
    take(takeAmount) {
        return new TakeIterator(this, takeAmount);
    }

    /**
     * Returns an iterator that skips while a condition is true.
     * The iterator will skip until the predicate returns false.
     * After that, all elements will be yielded as normal.
     * @param {Predicate} fn Predicate function.
     * @returns {SkipWhileIterator} The iterator.
     */
    skipWhile(fn) {
        return new SkipWhileIterator(this, fn);
    }

    /**
     * Returns an iterator that takes while a condition is true.
     * The iterator will take until the predicate returns false.
     * After that, the iterator is considered done.
     * @param {Predicate} fn Predicate function.
     * @returns {TakeWhileIterator} The iterator.
     */
    takeWhile(fn) {
        return new TakeWhileIterator(this, fn);
    }

    /**
     * Returns an iterator that puts multiple consecutive values into one value.
     * If the iterator does not divide evenly into the given size, there will be a shorter chunk at the end.
     * @param {number} chunkSize Size of a chunk.
     * @returns {ChunkIterator} The iterator.
     */
    chunk(chunkSize) {
        return new ChunkIterator(this, chunkSize);
    }

    /**
     * Returns an iterator that includes the index.
     * The iterator will iterate through (index, value) pairs.
     * @returns {EnumerateIterator} The iterator.
     */
    enumerate() {
        return new EnumerateIterator(this);
    }

    /**
     * Returns an iterator that is a chain of iterators.
     * Once one iterator is done, the next iterator starts.
     * @param {Array<Iterator|Iterable>} iters Iterators or iterables.
     * @returns {ConcatIterator} The iterator.
     */
    concat(...iters) {
        return new ConcatIterator(this, iters.map(iter => LazyIterator.from(iter)));
    }

    /**
     * Returns an iterator that repeats this iterator forever.
     * @returns {CycleIterator} The iterator.
     */
    cycle() {
        return new CycleIterator(this);
    }

    /**
     * Returns an iterator that maps each element with a function.
     * @param {Mapping} fn Mapping function.
     * @returns {MapIterator} The iterator.
     */
    map(fn) {
        return new MapIterator(this, fn);
    }

    /**
     * Returns an iterator that filters out certain elements.
     * @param {Predicate} fn Predicate function.
     * @returns {FilterIterator} The iterator.
     */
    filter(fn) {
        return new FilterIterator(this, fn);
    }

    /**
     * Returns an iterator that holds internal state.
     * Each element of the iterator is the state at that iteration.
     * This can be thought of as a reduce.
     * @param {Reducer} fn Reducer function.
     * @param {any} accum Accumulator.
     * @returns {ScanIterator} The iterator.
     */
    scan(fn, accum) {
        return new ScanIterator(this, fn, accum);
    }

    /**
     * Returns an iterator where each iterator is zipped with each other.
     * Each element is a tuple of zipped elements e.g. (a, b, c) if given two iterators.
     * @param {Array<Iterator|Iterable>} iters Iterators or iterables.
     * @returns {ZipIterator} The iterator.
     */
    zip(...iters) {
        return new ZipIterator(this, iters.map(iter => LazyIterator.from(iter)));
    }

    /**
     * Returns an iterator that flattens iterators and iterables inside this interator.
     * @param {number} [depth=1] The amount of depth to flatten.
     * @returns {FlattenIterator} The iterator.
     */
    flatten(depth = 1) {
        return new FlattenIterator(this, depth);
    }

    /**
     * Returns an iterator that flattens iterators and iterables from a mapping.
     * @param {Mapping} fn Mapping function.
     * @returns {FlatMapIterator} The iterator.
     */
    flatMap(fn) {
        return new FlatMapIterator(this, fn);
    }

    /**
     * Returns an iterator where between every element is the given value.
     * @param {any} val Value to join with.
     * @returns {JoinIterator} The iterator.
     */
    join(val) {
        return new JoinIterator(this, val);
    }

    /**
     * Returns an iterator where between every element are the values of the given iterator.
     * The joining iterator will be consumed and cycled through.
     * @param {Iterator|Iterable} iter Iterator to intercalate.
     * @returns {JoinWithIterator} The iterator.
     */
    joinWith(iter) {
        return new JoinWithIterator(this, LazyIterator.from(iter));
    }

    /**
     * Returns an iterator that calls a function on each element.
     * @param {Consumer} fn Consumer function.
     * @returns {EachIterator} The iterator.
     */
    each(fn) {
        return new EachIterator(this, fn);
    }

    /**
     * Calls a function on each element.
     * This consumes the iterator.
     * @param {Consumer} fn Consumer function.
     * @returns {void} Nothing.
     */
    forEach(fn) {
        for (const value of this) {
            fn(value);
        }
    }

    /**
     * Reduces each element into one single result.
     * Also known as fold, inject, etc.
     * This consumes the iterator.
     * @param {Reducer} fn Reducer function.
     * @param {any} [accum] The accumulator.
     * Defaults to the first element in the iterator.
     * @returns {any} The accumulator.
     */
    reduce(fn, accum) {
        if (accum === undefined) {
            const first = this.next();
            if (first.done) {
                throw new TypeError('Reduce of empty sequence with no initial value');
            }

            accum = first.value;
        }

        for (const value of this) {
            accum = fn(accum, value);
        }

        return accum;
    }

    /**
     * Takes the conjunction (logical AND) of every element.
     * An empty iterator will return true.
     * This consumes the iterator.
     * @returns {any}
     */
    and() {
        return this.reduce((a, b) => a && b, true);
    }

    /**
     * Takes the disjunction (logical OR) of every element.
     * An empty iterator will return false.
     * This consumes the iterator.
     * @returns {any}
     */
    or() {
        return this.reduce((a, b) => a || b, false);
    }

    /**
     * Sums or concatenates the elements in the iterator.
     * This consumes the iterator.
     * @returns {number|string} The sum or string.
     */
    sum() {
        return this.reduce((a, b) => a + b, 0);
    }

    /**
     * Takes the product of the elements in the iterator.
     * This consumes the iterator.
     * @returns {number} The product.
     */
    product() {
        return this.reduce((a, b) => a * b, 1);
    }

    /**
     * Finds a value in the iterator that passes the predicate.
     * This consumes the iterator until the found value.
     * @param {Predicate} fn Predicate function.
     * @returns {any} The found value.
     */
    find(fn) {
        for (const value of this) {
            if (fn(value)) {
                return value;
            }
        }

        return undefined;
    }

    /**
     * Finds the index of the value in the iterator that passes the predicate.
     * This consumes the iterator until the found value.
     * @param {Predicate} fn Predicate function.
     * @returns {number} The found index.
     */
    findIndex(fn) {
        let i = 0;
        for (const value of this) {
            if (fn(value)) {
                return i;
            }

            i++;
        }

        return -1;
    }

    /**
     * Checks if a value is in the iterator.
     * This consumes the iterator until the found value.
     * @param {any} searchElement Value to look for inclusion.
     * @param {number} [from=0] Index to search from.
     * @returns {boolean} Whether the value was found.
     */
    includes(searchElement, from = 0) {
        let i = 0;
        for (const value of this) {
            if (i < from) {
                i++;
                continue;
            }

            if (sameValueZero(searchElement, value)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks that every element in the iterator passes the predicate.
     * This consumes the iterator until a value that does not pass the predicate.
     * @param {Predicate} fn Predicate function.
     * @returns {boolean} Whether all elements passed or not.
     */
    every(fn) {
        for (const value of this) {
            if (!fn(value)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Checks that one element in the iterator passes the predicate.
     * This consumes the iterator until a value passes the predicate.
     * @param {Predicate} fn Predicate function.
     * @returns {boolean} Whether one element passed or not.
     */
    some(fn) {
        for (const value of this) {
            if (fn(value)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Finds the element that is considered the maximum.
     * A mapping can be passed to compare by an associated value.
     * This consumes the iterator.
     * @param {Mapping} [fn] Mapping function.
     * @returns {any} The maximum.
     */
    max(fn = x => x) {
        let max;
        const first = this.next();
        if (first.done) {
            return undefined;
        }

        max = first.value;
        for (const value of this) {
            if (fn(value) > fn(max)) {
                max = value;
            }
        }

        return max;
    }

    /**
     * Finds the element that is considered the minimum.
     * A mapping can be passed to compare by an associated value.
     * This consumes the iterator.
     * @param {Mapping} [fn] Mapping function.
     * @returns {any} The minimum.
     */
    min(fn = x => x) {
        let min;
        const first = this.next();
        if (first.done) {
            return undefined;
        }

        min = first.value;
        for (const value of this) {
            if (fn(value) < fn(min)) {
                min = value;
            }
        }

        return min;
    }

    /**
     * Finds the element that is considered the maximum by some comparison.
     * This consumes the iterator.
     * @param {Comparator} fn Comparator function.
     * @returns {any} The maximum.
     */
    maxBy(fn) {
        let max;
        const first = this.next();
        if (first.done) {
            return undefined;
        }

        max = first.value;
        for (const value of this) {
            if (fn(value, max) > 0) {
                max = value;
            }
        }

        return max;
    }

    /**
     * Finds the element that is considered the minimum by some comparison.
     * This consumes the iterator.
     * @param {Comparator} fn Comparator function.
     * @returns {any} The minimum.
     */
    minBy(fn) {
        let min;
        const first = this.next();
        if (first.done) {
            return undefined;
        }

        min = first.value;
        for (const value of this) {
            if (fn(value, min) < 0) {
                min = value;
            }
        }

        return min;
    }

    /**
     * Collects the iterator into a collection.
     * Defaults to an array.
     * This consumes the iterator.
     * @param {CollectionConstructor} [cons] Constructs a collection.
     * @param {CollectionExtender} [extend] Extends a collection.
     * @returns {any} The collection.
     */
    collect(cons = consFunctions.Array, extend = extendFunctions.Array) {
        let coll = cons();
        for (const value of this) {
            coll = extend(coll, value);
        }

        return coll;
    }

    /**
     * Partitions the iterator into a collection based on a predicate.
     * Items passing the predicate goes in the first collection.
     * Items not passing goes into the second collection.
     * The kind of collection defaults to an array.
     * This consumes the iterator.
     * @param {Predicate} fn Predicate fuction.
     * @param {CollectionConstructor} [cons] Constructs a collection.
     * @param {CollectionExtender} [extend] Extends a collection.
     * @returns {[any, any]} The collections.
     */
    partition(fn, cons = consFunctions.Array, extend = extendFunctions.Array) {
        let left = cons();
        let right = cons();
        for (const value of this) {
            if (fn(value)) {
                left = extend(left, value);
            } else {
                right = extend(right, value);
            }
        }

        return [left, right];
    }

    /**
     * Unzips an iterator of tuples into collections.
     * Each element in a tuple is added to the collection corresponding to their position.
     * Can be thought of as the opposite of zip.
     * The kind of collection defaults to an array.
     * This consumes the iterator.
     * @param {number} [size] Size of the tuples.
     * Defaults to the length of the first element.
     * @param {CollectionConstructor} [cons] Constructs a collection.
     * @param {CollectionExtender} [extend] Extends a collection.
     * @returns {any[]} The collections.
     */
    unzip(size, cons = consFunctions.Array, extend = extendFunctions.Array) {
        const first = this.next();
        let length;
        if (first.done) {
            if (size === undefined) {
                throw new TypeError('Unzip of empty sequence with no given size');
            }

            length = size;
        } else {
            length = size === undefined
                ? first.value.length
                : size;
        }

        const colls = Array.from({ length }, () => cons());
        if (!first.done) {
            for (let i = 0; i < length; i++) {
                colls[i] = extend(colls[i], first.value[i]);
            }
        }

        for (const value of this) {
            for (let i = 0; i < length; i++) {
                colls[i] = extend(colls[i], value[i]);
            }
        }

        return colls;
    }

    /**
     * Groups consecutive elements that are equal into an array of collections.
     * The kind of collection defaults to an array.
     * This consumes the iterator.
     * @param {Equality} [eq] Equality function.
     * @param {CollectionConstructor} [cons] Constructs a collection.
     * @param {CollectionExtender} [extend] Extends a collection.
     * @returns {any[]}
     */
    group(eq = (a, b) => sameValueZero(a, b), cons = consFunctions.Array, extend = extendFunctions.Array) {
        const arr = [];
        let accum = cons();
        let prev = null;

        const first = this.next();
        if (first.done) {
            return arr;
        }

        prev = first.value;
        accum = extend(accum, first.value);
        for (const value of this) {
            if (eq(prev, value)) {
                accum = extend(accum, value);
                prev = value;
            } else {
                arr.push(accum);
                accum = cons();
                accum = extend(accum, value);
                prev = value;
            }
        }

        arr.push(accum);
        return arr;
    }

    /**
     * Categorizes elements by some property.
     * The resulting map associates categories with collections of values.
     * The kind of collection defaults to an array.
     * This consumes the iterator.
     * @param {Mapping} fn Mapping function.
     * @param {CollectionConstructor} [cons] Constructs a collection.
     * @param {CollectionExtender} [extend] Extends a collection.
     * @returns {Map<any, any>}
     */
    categorize(fn, cons = consFunctions.Array, extend = extendFunctions.Array) {
        const map = new Map();
        for (const value of this) {
            const cat = fn(value);
            if (!map.has(cat)) {
                map.set(cat, cons());
            }

            map.set(cat, extend(map.get(cat), value));
        }

        return map;
    }

    /**
     * Clones the iterator.
     * This consumes the current iterator and recreates it.
     * @returns {LazyIterator} The cloned iterator.
     */
    clone() {
        const cache = this.collectArray();
        this.iterator = cache[Symbol.iterator]();
        return new LazyIterator(cache[Symbol.iterator]());
    }

    /**
     * Clones the iterator multiples times.
     * This consumes the current iterator and recreates it.
     * @param {number} amount Amount of times to clone.
     * @returns {LazyIterator[]} The cloned iterators.
     */
    cloneMany(amount) {
        const cache = this.collectArray();
        this.iterator = cache[Symbol.iterator]();
        return Array.from({ length: amount }, () => new LazyIterator(cache[Symbol.iterator]()));
    }

    /**
     * Checks if a value is an iterator.
     * @param {any} val Value to check.
     * @returns {boolean} Whether the value is an iterator.
     */
    static isIterator(val) {
        return typeof val.next === 'function';
    }

    /**
     * Checks if a value is an iterable.
     * @param {any} val Value to check.
     * @returns {boolean} Whether the value is an iterable.
     */
    static isIterable(val) {
        return val != null && val[Symbol.iterator] != null;
    }

    /**
     * Creates a lazy iterator from an iterator or iterable.
     * @param {Iterator|Iterable} iter Iterator or iterable.
     * @returns {LazyIterator} The iterator.
     */
    static from(iter) {
        if (LazyIterator.isIterator(iter)) {
            return new LazyIterator(iter);
        }

        if (LazyIterator.isIterable(iter)) {
            return new LazyIterator(iter[Symbol.iterator]());
        }

        throw new TypeError('Value given is not iterable or an iterator');
    }

    // Alias for above.
    static for(iter) {
        return LazyIterator.from(iter);
    }

    /**
     * Creates a lazy iterator for a sequence of items.
     * @param {any[]} items Items to yield.
     * @returns {LazyIterator} The iterator.
     */
    static of(...items) {
        return new LazyIterator(items[Symbol.iterator]());
    }

    /**
     * Generates an iterator yielding a range of integers.
     * @param {number} [start=0] The start value.
     * @param {number} [end=Infinity] The end value.
     * @param {number} [step=1] The step value.
     * @param {boolean} [inclusive=false] Whether or not this is an inclusive range.
     * @returns {LazyIterator} The iterator.
     */
    static range(start = 0, end = Infinity, step = 1, inclusive = false) {
        if (inclusive) {
            return new LazyIterator(function* range() {
                for (let i = start; i <= end; i += step) {
                    yield i;
                }
            }());
        }

        return new LazyIterator(function* range() {
            for (let i = start; i < end; i += step) {
                yield i;
            }
        }());
    }

    /**
     * Creates an iterator that yields an item for a certain amount of times.
     * @param {any} item Item to yield.
     * @param {number} [amount=Infinity] Amount of times to repeat.
     * @returns {LazyIterator} The iterator.
     */
    static repeat(item, amount = Infinity) {
        return new LazyIterator(function* repeat() {
            for (let i = 0; i < amount; i++) {
                yield item;
            }
        }());
    }

    /**
     * Creates an iterator that repeatedly yields the result of a function.
     * @param {Generating} fn Generating function.
     * @param {number} [amount=Infinity] Amount of times to repeat.
     * @returns {LazyIterator} The iterator.
     */
    static repeatWith(fn, amount = Infinity) {
        return new LazyIterator(function* repeatWith() {
            for (let i = 0; i < amount; i++) {
                yield fn();
            }
        }());
    }

    /**
     * Creates an iterator where each element is the previous element with the given function applied to it.
     * @param {Mapping} fn Mapping function.
     * @param {any} init Initial value.
     * @returns {LazyIterator} The iterator.
     */
    static iterate(fn, init) {
        return new LazyIterator(function* iterate() {
            let val = init;
            while (true) {
                yield val;
                val = fn(val);
            }
        }());
    }
}

const sameValueZero = (a, b) => {
    if (a === 0 && b === 0) {
        return 1 / a === 1 / b;
    }

    if (a === b) {
        return true;
    }

    return isNaN(a) && isNaN(b);
};

const consFunctions = {
    Array: () => {
        return [];
    },
    Set: () => {
        return new Set();
    },
    Map: () => {
        return new Map();
    },
    String: () => {
        return '';
    }
};

const extendFunctions = {
    Array: (c, i) => {
        c.push(i);
        return c;
    },
    Set: (c, i) => {
        c.add(i);
        return c;
    },
    Map: (c, i) => {
        c.set(i[0], i[1]);
        return c;
    },
    String: (c, i) => {
        return c + i;
    }
};

for (const type of ['Array', 'Set', 'Map', 'String']) {
    const fnName = `collect${type}`;
    Object.defineProperty(LazyIterator.prototype, fnName, {
        value: {
            // eslint-disable-next-line func-names
            [fnName]: function () {
                return this.collect(consFunctions[type], extendFunctions[type]);
            }
        }[fnName],
        writable: true,
        enumerable: false,
        configurable: true
    });
}

for (const method of ['partition', 'unzip', 'group', 'categorize']) {
    for (const type of ['Array', 'Set', 'Map', 'String']) {
        const fnName = `${method}${type}`;
        Object.defineProperty(LazyIterator.prototype, fnName, {
            value: {
                // eslint-disable-next-line func-names
                [fnName]: function (a1) {
                    return this[method](a1, consFunctions[type], extendFunctions[type]);
                }
            }[fnName],
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
}

class StepIterator extends LazyIterator {
    constructor(iterator, stepSize) {
        super(iterator);
        this.stepSize = stepSize;
    }

    next() {
        const item = this.iterator.next();
        for (let i = 0; i < this.stepSize - 1; i++) {
            this.iterator.next();
        }

        return item;
    }
}

class SkipIterator extends LazyIterator {
    constructor(iterator, skipAmount) {
        super(iterator);
        this.skipAmount = skipAmount;
    }

    next() {
        if (this.skipAmount !== 0) {
            this.skipAmount--;
            this.iterator.next();
            return this.next();
        }

        return this.iterator.next();
    }
}

class TakeIterator extends LazyIterator {
    constructor(iterator, takeAmount) {
        super(iterator);
        this.takeAmount = takeAmount;
    }

    next() {
        if (this.takeAmount !== 0) {
            this.takeAmount--;
            return this.iterator.next();
        }

        return { done: true };
    }
}

class SkipWhileIterator extends LazyIterator {
    constructor(iterator, fn) {
        super(iterator);
        this.fn = fn;
        this.finishedSkipping = false;
    }

    next() {
        if (!this.finishedSkipping) {
            const item = this.iterator.next();
            if (item.done) {
                return { done: true };
            }

            if (!this.fn(item.value)) {
                this.finishedSkipping = true;
                return { done: false, value: item.value };
            }

            return this.next();
        }

        return this.iterator.next();
    }
}

class TakeWhileIterator extends LazyIterator {
    constructor(iterator, fn) {
        super(iterator);
        this.fn = fn;
        this.finishedTaking = false;
    }

    next() {
        if (!this.finishedTaking) {
            const item = this.iterator.next();
            if (item.done) {
                return { done: true };
            }

            if (!this.fn(item.value)) {
                this.finishedTaking = true;
                return { done: true };
            }

            return { done: false, value: item.value };
        }

        return { done: true };
    }
}

class ChunkIterator extends LazyIterator {
    constructor(iterator, chunkSize) {
        super(iterator);
        this.chunkSize = chunkSize;
    }

    next() {
        const values = [];
        for (let i = 0; i < this.chunkSize; i++) {
            const item = this.iterator.next();
            if (!item.done) {
                values.push(item.value);
            }
        }

        if (!values.length) {
            return { done: true };
        }

        return { done: false, value: values };
    }
}

class EnumerateIterator extends LazyIterator {
    constructor(iterator) {
        super(iterator);
        this.index = 0;
    }

    next() {
        const item = this.iterator.next();
        if (item.done) {
            return { done: true };
        }

        return { done: false, value: [this.index++, item.value] };
    }
}

class ConcatIterator extends LazyIterator {
    constructor(iterator, concatIterators) {
        super(iterator);
        this.concatIterators = concatIterators;
        this.currentIterator = this.iterator;
    }

    next() {
        const item = this.currentIterator.next();
        if (item.done) {
            if (!this.concatIterators.length) {
                return { done: true };
            }

            this.currentIterator = this.concatIterators.shift();
            return this.next();
        }

        return item;
    }
}

class CycleIterator extends LazyIterator {
    constructor(iterator) {
        super(iterator);
        this.cache = [];
        this.cachedAll = false;
    }

    next() {
        const item = this.iterator.next();
        if (item.done) {
            this.iterator = new LazyIterator(this.cache[Symbol.iterator]());
            this.cachedAll = true;
            return this.next();
        }

        if (!this.cachedAll) {
            this.cache.push(item.value);
        }

        return item;
    }
}

class MapIterator extends LazyIterator {
    constructor(iterator, fn) {
        super(iterator);
        this.fn = fn;
    }

    next() {
        const item = this.iterator.next();
        return item.done
            ? { done: true }
            : { done: false, value: this.fn(item.value) };
    }
}

class FilterIterator extends LazyIterator {
    constructor(iterator, fn) {
        super(iterator);
        this.fn = fn;
    }

    next() {
        const item = this.iterator.next();
        return item.done
            ? { done: true }
            : this.fn(item.value)
                ? { done: false, value: item.value }
                : this.next();
    }
}

class ScanIterator extends LazyIterator {
    constructor(iterator, fn, accum) {
        super(iterator);
        this.fn = fn;
        this.accum = accum;
    }

    next() {
        const item = this.iterator.next();
        if (item.done) {
            return { done: true };
        }

        this.accum = this.fn(this.accum, item.value);
        return { done: false, value: this.accum };
    }
}

class ZipIterator extends LazyIterator {
    constructor(iterator, zipIterators) {
        super(iterator);
        this.zipIterators = zipIterators;
    }

    next() {
        const item = this.iterator.next();
        const zipItems = this.zipIterators.map(iter => iter.next());
        return item.done || zipItems.some(nz => nz.done)
            ? { done: true }
            : { done: false, value: [item.value, ...zipItems.map(zipItem => zipItem.value)] };
    }
}

class FlattenIterator extends LazyIterator {
    constructor(iterator, depth) {
        super(iterator);
        this.depth = depth;
        this.flattenIterator = null;
    }

    next() {
        if (this.flattenIterator) {
            const item = this.flattenIterator.next();
            if (item.done) {
                this.flattenIterator = null;
                return this.next();
            }

            return item;
        }

        const item = this.iterator.next();
        if (item.done) {
            return { done: true };
        }

        if (this.depth > 0 && (LazyIterator.isIterable(item.value) || LazyIterator.isIterator(item.value))) {
            this.flattenIterator = new FlattenIterator(LazyIterator.from(item.value), this.depth - 1);
            return this.flattenIterator.next();
        }

        return item;
    }
}

class FlatMapIterator extends LazyIterator {
    constructor(iterator, fn) {
        super(iterator);
        this.fn = fn;
        this.flattenIterator = null;
    }

    next() {
        if (this.flattenIterator) {
            const item = this.flattenIterator.next();
            if (item.done) {
                this.flattenIterator = null;
                return this.next();
            }

            return item;
        }

        const item = this.iterator.next();
        if (item.done) {
            return { done: true };
        }

        const value = this.fn(item.value);
        if (LazyIterator.isIterable(value) || LazyIterator.isIterator(value)) {
            this.flattenIterator = new FlattenIterator(LazyIterator.from(value), 1);
            return this.flattenIterator.next();
        }

        return { done: false, value };
    }
}

class JoinIterator extends LazyIterator {
    constructor(iterator, joinValue) {
        super(iterator);
        this.joinValue = joinValue;
        this.joinNext = false;
    }

    next() {
        if (this.joinNext) {
            this.joinNext = false;
            return { done: false, value: this.joinValue };
        }

        const item = this.iterator.next();
        if (item.done) {
            return { done: true };
        }

        if (!this.iterator.peek().done) {
            this.joinNext = true;
        }

        return item;
    }
}

class JoinWithIterator extends LazyIterator {
    constructor(iterator, joinWithIterator) {
        super(iterator);
        this.joinWithIterator = joinWithIterator;
        this.joinNext = false;
        this.cache = [];
        this.cachedAll = false;
    }

    next() {
        if (this.joinNext) {
            const item = this.joinWithIterator.next();
            if (item.done) {
                this.joinWithIterator = new LazyIterator(this.cache[Symbol.iterator]());
                this.joinNext = false;
                this.cachedAll = true;
                return this.next();
            }

            if (!this.cachedAll) {
                this.cache.push(item.value);
            }

            return item;
        }

        const item = this.iterator.next();
        if (item.done) {
            return { done: true };
        }

        if (!this.iterator.peek().done) {
            this.joinNext = true;
        }

        return item;
    }
}

class EachIterator extends LazyIterator {
    constructor(iterator, fn) {
        super(iterator);
        this.fn = fn;
    }

    next() {
        const item = this.iterator.next();
        if (!item.done) {
            this.fn(item.value);
        }

        return item;
    }
}

module.exports = LazyIterator;

/**
 * @callback Mapping
 * @param {any} item Item to map.
 * @returns {any} Mapped item.
 */

/**
 * @callback Predicate
 * @param {any} item Item to check.
 * @returns {boolean} Whether or not the item passed.
 */

/**
 * @callback Consumer
 * @param {any} item Item to use.
 * @returns {void} Nothing.
 */

/**
 * @callback Reducer
 * @param {any} accum The accumulator.
 * @param {any} item The current item.
 * @returns {any} The new accumulator.
 */

/**
 * @callback Comparator
 * @param {any} a Item to compare.
 * @param {any} b Item to compare.
 * @returns {number} The ordering of the items.
 */

/**
 * @callback CollectionConstructor
 * @returns {any} The empty collection.
 */

/**
 * @callback CollectionExtender
 * @param {any} coll The collection.
 * @param {any} item The item to add to the collection.
 * @returns {any} The extended collection.
 */

/**
 * @callback Equality
 * @param {any} a Item to compare.
 * @param {any} b Item to compare.
 * @returns {boolean} Whether the items are equal.
 */

/**
 * @callback Generating
 * @returns {any} A value.
 */
