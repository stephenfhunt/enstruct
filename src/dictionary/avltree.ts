export default class AvlTree<K, V> implements Map<K, V> {
    clear(): void {
        throw new Error("Method not implemented.");
    }
    delete(key: K): boolean {
        throw new Error("Method not implemented.");
    }
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        throw new Error("Method not implemented.");
    }
    get(key: K): V | undefined {
        throw new Error("Method not implemented.");
    }
    has(key: K): boolean {
        throw new Error("Method not implemented.");
    }
    set(key: K, value: V): this {
        throw new Error("Method not implemented.");
    }
    get size(): number {
        throw new Error("Method not implemented.");
    }
    [Symbol.iterator](): IterableIterator<[K, V]> {
        throw new Error("Method not implemented.");
    }
    entries(): IterableIterator<[K, V]> {
        throw new Error("Method not implemented.");
    }
    keys(): IterableIterator<K> {
        throw new Error("Method not implemented.");
    }
    values(): IterableIterator<V> {
        throw new Error("Method not implemented.");
    }
    [Symbol.toStringTag]: string;

    static [Symbol.species] = AvlTree;
}