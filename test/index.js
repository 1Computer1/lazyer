const assert = require('assert');
const lazy = require('..');

const equal = (a, b) => {
    try {
        assert.deepStrictEqual(a, b);
        return true;
    } catch (e) {
        return false;
    }
};

const should = (desc, fn) => {
    if (!fn()) {
        throw new Error(`Test did not ${desc}`);
    }
};

should('take in an iterable', () => {
    const res = lazy.from([1, 2, 3, 4]).collect();
    return equal(res, [1, 2, 3, 4]);
});

should('take in an iterator', () => {
    const res = lazy.from([1, 2, 3, 4][Symbol.iterator]()).collect();
    return equal(res, [1, 2, 3, 4]);
});

should('get the nth element', () => {
    const res = lazy.from([1, 2, 3, 4]).at(2);
    return res === 3;
});

should('count the amount of elements', () => {
    const res = lazy.from([1, 2, 3, 4]).count();
    return res === 4;
});

should('retrieve the last element', () => {
    const res = lazy.from([8, 7, 6, 5]).last();
    return res === 5;
});

should('step by a certain interval', () => {
    const res = lazy.from([1, 2, 3, 4])
        .stepBy(2)
        .collect();
    return equal(res, [1, 3]);
});

should('skip by a certain amount', () => {
    const res = lazy.from([1, 2, 3, 4])
        .skip(2)
        .collect();
    return equal(res, [3, 4]);
});

should('take only a certain amount', () => {
    const res = lazy.from([1, 2, 3, 4])
        .take(2)
        .collect();
    return equal(res, [1, 2]);
});

should('skip while a certain condition is met', () => {
    const res = lazy.from([1, 2, 3, 4])
        .skipWhile(n => n < 3)
        .collect();
    return equal(res, [3, 4]);
});

should('take while a certain condition met', () => {
    const res = lazy.from([1, 2, 3, 4])
        .takeWhile(n => n < 3)
        .collect();
    return equal(res, [1, 2]);
});

should('put the iterator into chunks', () => {
    const res = lazy.from([1, 2, 3, 4, 5, 6, 7, 8, 9])
        .chunk(2)
        .collect();
    return equal(res, [[1, 2], [3, 4], [5, 6], [7, 8], [9]]);
});

should('enumerate the iterator', () => {
    const res = lazy.from([1, 2, 3, 4])
        .enumerate()
        .collect();
    return equal(res, [[0, 1], [1, 2], [2, 3], [3, 4]]);
});

should('concatenate two iterators', () => {
    const res = lazy.from([1, 2, 3, 4])
        .concat([5, 6, 7, 8])
        .collect();
    return equal(res, [1, 2, 3, 4, 5, 6, 7, 8]);
});

should('cycle on forever', () => {
    const res = lazy.from([1, 2])
        .cycle()
        .take(11)
        .collect();
    return equal(res, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]);
});

should('map each value', () => {
    const res = lazy.from([1, 2, 3, 4])
        .map(n => n * 2)
        .collect();
    return equal(res, [2, 4, 6, 8]);
});

should('filter values based on a predicate', () => {
    const res = lazy.from([1, 2, 3, 4])
        .filter(n => n % 2 === 0)
        .collect();
    return equal(res, [2, 4]);
});

should('do iterations holding an internal state with initial value', () => {
    const res = lazy.from([1, 2, 3, 4])
        .scan((acc, n) => acc + n, 0)
        .collect();
    return equal(res, [0, 1, 3, 6, 10]);
});

should('do iterations holding an internal state without initial value', () => {
    const res = lazy.from([1, 2, 3, 4])
        .scan((acc, n) => acc + n)
        .collect();
    return equal(res, [1, 3, 6, 10]);
});

should('zip multiple iterators together', () => {
    const res = lazy.from([1, 2, 3, 4])
        .zip(['a', 'b', 'c', 'd'], [true, false, true, false])
        .collect();
    return equal(res, [[1, 'a', true], [2, 'b', false], [3, 'c', true], [4, 'd', false]]);
});

should('flatten with depth of infinity', () => {
    const res = lazy.from([[1, 2], 3, [4], [5, [6, 7], 8, [[9], 10], 11], [12, 13, 14], 15])
        .flat(Infinity)
        .collect();
    return equal(res, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
});

should('flatten with depth of 1', () => {
    const res = lazy.from([[1, 2], [3, 4], [[5, 6, 7, 8]], 9, 10])
        .flat(1)
        .collect();
    return equal(res, [1, 2, 3, 4, [5, 6, 7, 8], 9, 10]);
});

should('flatten with depth of 2', () => {
    const res = lazy.from([[1, 2], [3, 4], [[5, 6, 7, 8]], 9, 10])
        .flat(2)
        .collect();
    return equal(res, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

should('flatten values mapped into iterators', () => {
    const res = lazy.from([3, 4, 5])
        .flatMap(n => lazy.range(1, 4).map(i => n * i))
        .collect();
    return equal(res, [3, 6, 9, 4, 8, 12, 5, 10, 15]);
});

should('join the iterator with some value', () => {
    const res = lazy.from([1, 2, 3, 4])
        .join(5)
        .collect();
    return equal(res, [1, 5, 2, 5, 3, 5, 4]);
});

should('join the iterator with another iterator', () => {
    const res = lazy.from([1, 2, 3, 4])
        .joinWith([5, 6])
        .collect();
    return equal(res, [1, 5, 6, 2, 5, 6, 3, 5, 6, 4]);
});

should('call a function for each element', () => {
    let count1 = 0;
    let count2 = 0;
    lazy.from([1, 2, 3, 4]).each(() => count1++).forEach(() => count2++);
    return count1 === count2 && count1 === 4;
});

should('reduce without an initial value', () => {
    const res = lazy.from([1, 2, 3, 4]).reduce((acc, n) => acc + n);
    return res === 10;
});

should('reduce with an initial value', () => {
    const res = lazy.from([1, 2, 3, 4]).reduce((acc, n) => acc + n, 5);
    return res === 15;
});

should('error when reducing empty iterator without initial value', () => {
    try {
        lazy.from([]).reduce((acc, n) => acc + n);
        return false;
    } catch (e) {
        return /^Reduce of empty sequence with no initial value$/.test(e.message);
    }
});

should('take the conjuction of an iterator', () => {
    const res = lazy.from([true, true, true]).and();
    return res;
});

should('take the disjunction of an iterator', () => {
    const res = lazy.from([true, false, true]).or();
    return res;
});

should('take the sum of an iterator', () => {
    const res = lazy.from([1, 2, 3, 4]).sum();
    return res === 10;
});

should('take the product of an iterator', () => {
    const res = lazy.from([1, 2, 3, 4]).product();
    return res === 24;
});

should('find a value in the iterator', () => {
    const res = lazy.from([1, 2, 3, 4]).find(n => n * 2 === 8);
    return res === 4;
});

should('not find a value in the iterator', () => {
    const res = lazy.from([1, 2, 3, 4]).find(n => n * 2 === 9);
    return res === undefined;
});

should('find an index in the iterator', () => {
    const res = lazy.from([1, 2, 3, 4]).findIndex(n => n * 2 === 8);
    return res === 3;
});

should('not find an index in the iterator', () => {
    const res = lazy.from([1, 2, 3, 4]).findIndex(n => n * 2 === 9);
    return res === -1;
});

should('check if the iterator includes a value', () => {
    const res = lazy.from([1, 2, 3, 4, 5]).includes(3);
    return res;
});

should('check if the iterator includes a value from some index', () => {
    const res1 = lazy.from([1, 2, 3, 4, 5]).includes(3, 2);
    const res2 = lazy.from([1, 2, 3, 4, 5]).includes(3, 3);
    return res1 && !res2;
});

should('check every element passes a predicate', () => {
    const res = lazy.from([2, 4, 6, 8]).every(n => n % 2 === 0);
    return res;
});

should('check some element passes a predicate', () => {
    const res = lazy.from([3, 5, 6, 9]).some(n => n % 2 === 0);
    return res;
});

should('find the maximum value', () => {
    const res = lazy.from([1, 2, 3, 4]).max();
    return res === 4;
});

should('find the minimum value', () => {
    const res = lazy.from([1, 2, 3, 4]).min();
    return res === 1;
});

should('find the maximum value by some key', () => {
    const res = lazy.from([1, 2, -3, -4]).max(n => Math.abs(n));
    return res === -4;
});

should('find the minimum value by some key', () => {
    const res = lazy.from([1, 2, -3, -4]).min(n => Math.abs(n));
    return res === 1;
});

should('find the maximum value by a comparator', () => {
    const res = lazy.from(['a', 'B', 'c', 'D']).maxBy((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return res === 'D';
});

should('find the minimum value by a comparator', () => {
    const res = lazy.from(['A', 'b', 'C', 'd']).minBy((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return res === 'A';
});

should('collect into a Set', () => {
    const res = lazy.from([1, 1, 2, 2, 3, 3]).collectSet();
    return equal(res, new Set([1, 2, 3]));
});

should('collect into a Map', () => {
    const res = lazy.from([[1, 1], [2, 2], [3, 3]]).collectMap();
    return equal(res, new Map([[1, 1], [2, 2], [3, 3]]));
});

should('collect into a string', () => {
    const res = lazy.from('abcd').collectString();
    return res === 'abcd';
});

should('partition the iterator by a predicate', () => {
    const res = lazy.from([1, 2, 3, 4]).partition(n => n % 2 === 0);
    return equal(res, [[2, 4], [1, 3]]);
});

should('unzip an iterator of tuples', () => {
    const res = lazy.from(['a', 'b', 'c', 'd'])
        .zip([1, 2, 3, 4], [5, 6, 7, 8])
        .unzip();
    return equal(res, [['a', 'b', 'c', 'd'], [1, 2, 3, 4], [5, 6, 7, 8]]);
});

should('group consecutive equal elements', () => {
    const res = lazy.from([1, 1, 2, 2, 3, 1, 1, 1, 2, 2, 3]).group();
    return equal(res, [[1, 1], [2, 2], [3], [1, 1, 1], [2, 2], [3]]);
});

should('categorize elements by some criteria', () => {
    const res = lazy.from(['a', 'A', 'b', 'B', 'c', 'C']).categorize(c => c.toUpperCase());
    return equal(res, new Map([
        ['A', ['a', 'A']],
        ['B', ['b', 'B']],
        ['C', ['c', 'C']]
    ]));
});

should('clone an iterator', () => {
    const iterator = lazy.from([1, 2, 3, 4]);
    iterator.next();
    const clone = iterator.clone();
    const res1 = iterator.collect();
    const res2 = clone.collect();
    return equal(res1, res2) && equal(res1, [2, 3, 4]);
});

should('generate an exclusive range', () => {
    const res = lazy.range(1, 5).collect();
    return equal(res, [1, 2, 3, 4]);
});

should('generate an inclusive range', () => {
    const res = lazy.range(1, 5, 1, true).collect();
    return equal(res, [1, 2, 3, 4, 5]);
});

should('generate an inclusive range with a step', () => {
    const res = lazy.range(1, 5, 2, true).collect();
    return equal(res, [1, 3, 5]);
});

should('repeat an item forever', () => {
    const res = lazy.repeat(1)
        .take(5)
        .collect();
    return equal(res, [1, 1, 1, 1, 1]);
});

should('iterate only once', () => {
    let count = 0;
    const makeIterator = () => {
        const arr = [1, 2, 3, 4];
        let index = 0;
        return {
            next: () => {
                count++;
                return {
                    value: arr[index++],
                    done: index - 1 === arr.length
                };
            }
        };
    };

    lazy.from(makeIterator())
        .map(n => n * 2)
        .filter(n => n > 2)
        .collect();
    return count === 5;
});

should('generate the fibonacci sequence', () => {
    const res = lazy.range()
        .scan(([a, b]) => [b, a + b], [0, 1])
        .map(([a]) => a)
        .take(10)
        .collect();
    return equal(res, [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);
});
