import { DictEntries } from ".";
import {Comparison, defaultCompare} from "..";
import { BstNode } from "./tree";

export class AvlTree<K, V> implements Map<K, V> {
    #root: BstNode<K, V>|null = null;
    #comparison: Comparison<K>;

    constructor(comparison: Comparison<K> = defaultCompare,
                entries?: DictEntries<K, V>) {
        this.#comparison = comparison;

        for (let [k, v] of entries ?? []) {
            this.set(k, v);
        }
    }

    clear(): void {
        this.#root = null;
    }

    delete(key: K): boolean {
        throw new Error("Method not implemented.");
    }

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        for (let [k, v] of this.entries()) {
            callbackfn.apply(thisArg, [v, k, this]);
        }
    }

    get(key: K): V | undefined {
        if (this.#root !== null) {
            return this.#root.search(this.#comparison, key);
        }

        return undefined;
    }

    has(key: K): boolean {
        throw new Error("Method not implemented.");
    }
    set(key: K, value: V): this {
        if (this.#root === null) {
            this.#root = new BstNode(key, value);
        } else {
            this.#root.insert(key, value, this.#comparison);
            //throw new Error("need to implement balancing");
        }

        return this;
    }
    get size(): number {
        return this.#root?.count() ?? 0;
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