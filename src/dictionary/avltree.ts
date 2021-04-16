import { DictEntries } from ".";
import {Comparison, ComparisonResult, defaultCompare} from "..";
import { bstCount, BstNode, bstSearch, bstTraverse } from "./tree";

function rotateLeft<K, V>(node: AvlNode<K, V>) {
    const parent = node.parent;
    const right = node.right;
    const left = right?.left ?? null;

    if (right !== null) right.left = node;
    node.parent = right;
    node.right = left;

    if (left !== null) {
        left.parent = node;
    }

    if (parent !== null) {
        if (node === parent.left) {
            parent.left = right;
        } else if (node === parent.right) {
            parent.right = right;
        }

        if (right !== null) right.parent = parent;
    } else {
        // right is the new root
        if (right !== null) right.parent = null;
    }
}

function rotateRight<K, V>(node: AvlNode<K, V>) {
    const parent = node.parent;
    const left = node.left;
    const right = left?.right ?? null;

    if (left !== null) left.right = node;
    node.parent = left;
    node.left = right;

    if (right !== null) {
        right.parent = node;
    }

    if (parent !== null) {
        if (node === parent.left) {
            parent.left = left;
        } else if (node === parent.right) {
            parent.right = left;
        }

        if (left !== null) left.parent = parent;
    } else {
        // left is the new root
        if (left !== null) left.parent = null;
    }
}

class AvlNode<K, V> implements BstNode<K, V> {
    left: AvlNode<K, V>|null = null;
    right: AvlNode<K, V>|null = null;
    height: number = 1;

    constructor(public readonly key: K, 
                public value: V, 
                public parent: AvlNode<K, V>|null) {}

    insert(key: K, value: V, comparison: Comparison<K>): AvlNode<K, V> {
        const comparisonResult = comparison(key, this.key);
        let newNode = null;

        if (comparisonResult === ComparisonResult.EQUAL) {
            this.value = value;
            newNode = this;
        } else if (comparisonResult === ComparisonResult.LESS) { // to the left
            if (this.left === null) {
                newNode = new AvlNode(key, value, this);
                this.left = newNode;
            } else {
                newNode = this.left.insert(key, value, comparison);
            }
        } else { // to the right
            if (this.right === null) {
                newNode = new AvlNode(key, value, this);
                this.right = newNode;
            } else {
                newNode = this.right.insert(key, value, comparison);
            }
        }

        this.updateHeight();
        this.balanceAfterInsert();

        return newNode;
    }

    getBalanceFactor(): number {
        const leftHeight = this.left?.height ?? 0;
        const rightHeight = this.right?.height ?? 0;
        return rightHeight - leftHeight;
    }

    updateHeight(): void {
        const leftHeight = this.left?.height ?? 0;
        const rightHeight = this.right?.height ?? 0;
        this.height = Math.max(leftHeight, rightHeight) + 1;
    }

    balanceAfterInsert(): void {
        const balanceFactor = this.getBalanceFactor();
        if (balanceFactor < -1 || balanceFactor > 1) {
            let child;
            if (balanceFactor < 0) {
                const left = this.left as AvlNode<K, V>;
                child = left;
                if (left.getBalanceFactor() < 0) {
                    rotateRight(this);
                } else {
                    rotateLeft(left);
                    rotateRight(this);
                }
            }  else {
                const right = this.right as AvlNode<K, V>;
                child = right;
                if (right.getBalanceFactor() < 0) {
                    rotateRight(right);
                    rotateLeft(this);
                } else {
                    rotateLeft(this);
                }
            }

            child.updateHeight();
            this.updateHeight();
        }
    }
}

export class AvlTree<K, V> implements Map<K, V> {
    #root: AvlNode<K, V>|null = null;
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
        const present = this.has(key);
        //this.#root = this.#root?.delete(key, this.#comparison) ?? null;
        return present;
    }

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        for (let [k, v] of this.entries()) {
            callbackfn.apply(thisArg, [v, k, this]);
        }
    }

    get(key: K): V | undefined {
        return bstSearch(this.#root, this.#comparison, key);
    }

    has(key: K): boolean {
        return this.get(key) !== undefined;
    }

    set(key: K, value: V): this {
        if (this.#root === null) {
            this.#root = new AvlNode(key, value, null);
            return this;
        }

        const newNode = this.#root.insert(key, value, this.#comparison);
        this.updateRootFrom(newNode);
        return this;
    }

    get size(): number {
        return bstCount(this.#root);
    }

    [Symbol.iterator](): IterableIterator<[K, V]> {
        return this.entries();
    }

    entries(): IterableIterator<[K, V]> {
        return bstTraverse(this.#root);
    }

    *keys(): IterableIterator<K> {
        for (const [k] of this.entries()) {
            yield k;
        }
    }

    *values(): IterableIterator<V> {
        for (const [k, v] of this.entries()) {
            yield v;
        }
    }

    get [Symbol.toStringTag](): string {
        function render(node: AvlNode<K, V>|null): string {
            if (node === null) return 'null';
            else return `(${node.key},${node.value})`;
        }
        let level = [this.#root];
        let result = '\n';

        while (level.length > 0) {
            result += level.map(render).join(' ') + '\n';
            level = level.reduce((acc, node) => {
                if (node !== null)
                    return acc.concat(node.left, node.right);
                else return acc;
            }, [] as (AvlNode<K,V>|null)[]);
        }

        return result;
        /*
        let result = "\n";
        for (let [k, v] of this.entries()) {
            result += "    " + k + " => " + v + "\n";
        }
        return result;*/
    }

    get balanced(): boolean {
        if (this.#root === null) return true;
        const balanceFactor = this.#root.getBalanceFactor();
        return balanceFactor >= -1 && balanceFactor <= 1;
    }

    static [Symbol.species] = AvlTree;

    private updateRootFrom(node: AvlNode<K, V>): void {
        while (node.parent !== null) node = node.parent;
        this.#root = node;
    }
}