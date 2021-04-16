import { DictEntries } from ".";
import {Comparison, ComparisonResult, defaultCompare} from "..";
import { bstCount, bstFindNode, bstFindReplacement, BstNode, bstSearch, bstTraverse, rotateLeft, rotateRight } from "./tree";

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

    balanceAfterDelete(): void {
        const balanceFactor = this.getBalanceFactor();
        if (balanceFactor === -2 || balanceFactor === 2) {
            if (balanceFactor === -2) {
                const leftLeft = this.left?.left;                
                const leftLeftHeight = leftLeft?.height ?? 0;
                const leftRight = this.left?.right;
                const leftRightHeight = leftRight?.height ?? 0;
                if (leftLeftHeight >= leftRightHeight) {
                    rotateRight(this);
                    this.updateHeight();
                    if (this.parent !== null) {
                        this.parent.updateHeight();
                    }
                } else {
                    if (this.left !== null) rotateLeft(this.left);
                    rotateRight(this);

                    const parent = this.parent;
                    parent?.left?.updateHeight();
                    parent?.right?.updateHeight();
                    parent?.updateHeight();
                }
            } else if (balanceFactor === 2) {
                const rightRight = this.right?.right;
                const rightRightHeight = rightRight?.height ?? 0;
                const rightLeft = this.right?.left;
                const rightLeftHeight = rightLeft?.height ?? 0;
                if (rightRightHeight >= rightLeftHeight) {
                    rotateLeft(this);
                    this.updateHeight();
                    this.parent?.updateHeight();
                } else {
                    if (this.right !== null) rotateRight(this.right);
                    rotateLeft(this);

                    const parent = this.parent;
                    parent?.left?.updateHeight();
                    parent?.right?.updateHeight();
                    parent?.updateHeight();
                }
            }
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
        const nodeToRemove = bstFindNode(this.#root, this.#comparison, key);

        if (nodeToRemove !== null) {
            const replacementNode = bstFindReplacement(nodeToRemove);
            let nodeToAdjust = replacementNode?.parent ?? null;
            if (nodeToAdjust === null) {
                nodeToAdjust = nodeToRemove.parent;
            }

            if (nodeToAdjust !== null && nodeToAdjust === nodeToRemove) {
                nodeToAdjust = replacementNode;
            }

            this.replaceWith(nodeToRemove, replacementNode);

            let rootSearchStart = null;
            while (nodeToAdjust !== null) {
                rootSearchStart = nodeToAdjust;
                nodeToAdjust.updateHeight();
                nodeToAdjust.balanceAfterDelete(); 
                nodeToAdjust = nodeToAdjust.parent;
            }

            // the rebalance might have changed the root node,
            // so go find it to make sure its up to date
            if (rootSearchStart !== null)
                this.updateRootFrom(rootSearchStart);

            return true;
        }
        else return false;
    }

    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void {
        for (let [k, v] of this.entries()) {
            callbackfn.apply(thisArg, [v, k, this]);
        }
    }

    get(key: K): V | undefined {
        return bstSearch(this.#root, this.#comparison, key) ?? undefined;
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
        return "AvlTree";
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

    private replaceWith(toRemove: AvlNode<K,V>, 
                        replacement: AvlNode<K,V>|null): void {
        if (replacement !== null) {
            const replacementLeft = replacement.left;
            const replacementRight = replacement.right;

            const toRemoveLeft = toRemove.left;
            if (toRemoveLeft !== null && toRemoveLeft !== replacement) {
                replacement.left = toRemoveLeft;
                toRemoveLeft.parent = replacement;
            }

            const toRemoveRight = toRemove.right;
            if (toRemoveRight !== null && toRemoveRight !== replacement) {
                replacement.right = toRemoveRight;
                toRemoveRight.parent = replacement;
            }

            const replacementParent = replacement.parent;
            if (replacementParent !== null && replacementParent !== toRemove) {
                const parentLeft = replacementParent.left;
                const parentRight = replacementParent.right;
                if (parentLeft !== null && parentLeft === replacement) {
                    replacementParent.left = replacementRight;
                    if (replacementRight !== null) {
                        replacementRight.parent = replacementParent;
                    }
                } else if (parentRight !== null && parentRight === replacement) {
                    replacementParent.right = replacementLeft;
                    if (replacementLeft !== null) {
                        replacementLeft.parent = replacementParent;
                    }
                }
            }
        }

        const parent = toRemove.parent;
        if (parent === null) {
            this.#root = replacement;
            if (this.#root !== null) this.#root.parent = null;
        } else if (parent.left !== null &&
                   this.#comparison(parent.left.key, toRemove.key) === ComparisonResult.EQUAL) {
            parent.left = replacement;
            if (replacement !== null) {
                replacement.parent = parent;
            }
        } else if (parent.right !== null &&
                   this.#comparison(parent.right.key, toRemove.key) === ComparisonResult.EQUAL) {
            parent.right = replacement;
            if (replacement !== null) {
                replacement.parent = parent;
            }
        }
    }
}