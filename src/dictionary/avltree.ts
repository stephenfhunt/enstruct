import { DictEntries } from ".";
import {Comparison, ComparisonResult, defaultCompare} from "..";
import { bstCount, bstDelete, BstNode, bstSearch, bstTraverse, rotateLeft, rotateRight } from "./tree";

function updateBalanceFactor<K, V>(node: AvlNode<K, V>): void {
    if (node.balanceFactor > 1 || node.balanceFactor < -1) {
        rebalance(node);
    } else if (node.parent !== null) {
        if (node.parent.left === node) {
            node.parent.balanceFactor++;
        } else if (node.parent.right === node) {
            node.parent.balanceFactor--;
        }

        if (node.parent.balanceFactor !== 0) {
            updateBalanceFactor(node.parent);
        }
    }
}

function avlRotateLeft<K,V>(rootNode: AvlNode<K,V>): void {
    const newRoot: AvlNode<K,V> = rotateLeft(rootNode);
    rootNode.balanceFactor += 1 - Math.min(newRoot.balanceFactor, 0);
    newRoot.balanceFactor += 1 + Math.max(rootNode.balanceFactor, 0);
}

function avlRotateRight<K,V>(rootNode: AvlNode<K,V>): void {
    const newRoot: AvlNode<K,V> = rotateRight(rootNode);
    rootNode.balanceFactor -= 1 + Math.max(newRoot.balanceFactor, 0);
    newRoot.balanceFactor -= 1 - Math.min(rootNode.balanceFactor, 0);
}

function rebalance<K, V>(node: AvlNode<K, V>): void {
    if (node.balanceFactor < 0) {
        if ((<AvlNode<K,V>>node?.right)?.balanceFactor > 0) {
            avlRotateRight(node.right as AvlNode<K,V>);
        }
        avlRotateLeft(node);
    } else if (node.balanceFactor > 0) {
        if ((<AvlNode<K,V>>node?.left)?.balanceFactor < 0) {
            avlRotateLeft(node.left as AvlNode<K,V>);
        }

        avlRotateRight(node);
    }
}

class AvlNode<K, V> implements BstNode<K, V> {
    left: AvlNode<K, V>|null = null;
    right: AvlNode<K, V>|null = null;
    parent: AvlNode<K, V>|null = null;
    balanceFactor: number = 0;

    constructor(public readonly key: K, public value: V) {}

    insert(key: K, value: V, comparison: Comparison<K>): AvlNode<K, V> {
        if (comparison(key, this.key) === ComparisonResult.EQUAL) {
            this.value = value;
        } else if (comparison(key, this.key) === ComparisonResult.LESS) { // to the left
            if (this.left === null) {
                const newLeft = new AvlNode(key, value);
                newLeft.parent = this;
                this.left = newLeft;
                updateBalanceFactor(newLeft);
            } else {
                this.left.insert(key, value, comparison);
            }

        } else { // to the right
            if (this.right === null) {
                const newRight = new AvlNode(key, value);
                newRight.parent = this;
                this.right = newRight;
                updateBalanceFactor(newRight);
            } else {
                this.right.insert(key, value, comparison);
            }
        }

        // find the new root
        let root: AvlNode<K, V> = this;
        while (root.parent !== null) root = root.parent;
        return root;
    }

    delete(key: K, comparison: Comparison<K>): AvlNode<K, V>|null {
        return bstDelete(this, comparison, key) as AvlNode<K, V>|null;
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
        this.#root = this.#root?.delete(key, this.#comparison) ?? null;
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
            this.#root = new AvlNode(key, value);
        } else {
            this.#root = this.#root.insert(key, value, this.#comparison);
        }

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
        let result = "\n";
        for (let [k, v] of this.entries()) {
            result += "    " + k + " => " + v + "\n";
        }
        return result;
    }

    static [Symbol.species] = AvlTree;
}