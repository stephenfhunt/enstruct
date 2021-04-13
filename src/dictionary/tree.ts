import {Comparison, ComparisonResult} from "..";

export class BstNode<K, V> {
    left: BstNode<K, V>|null;
    right: BstNode<K, V>|null;

    constructor(public readonly key: K, 
                public value: V) {
        this.left = null;
        this.right = null;
    }

    insert(key: K, value: V, comparison: Comparison<K>): void {
        if (comparison(this.key, key) === ComparisonResult.EQUAL) {
            this.value = value;
        } else if (comparison(this.key, key) === ComparisonResult.LESS) { // to the left
            if (this.left === null) {
                this.left = new BstNode(key, value);
            } else {
                this.left.insert(key, value, comparison);
            }
        } else { // to the right
            if (this.right === null) {
                this.right = new BstNode(key, value);
            } else {
                this.right.insert(key, value, comparison);
            }
        }
    }

    search(compare: Comparison<K>, key: K): V|undefined {
        const comp = compare(this.key, key);
        if (comp === ComparisonResult.EQUAL) {
            return this.value;
        } else if (comp === ComparisonResult.LESS && this.left !== null) {
            return this.left.search(compare, key); 
        } else if (comp === ComparisonResult.GREATER && this.right !== null) {
            return this.right.search(compare, key);
        }

        return undefined;
    }

    count(): number {
        const lefts = this.left?.count() ?? 0;
        const rights = this.right?.count() ?? 0;
        return lefts + rights + 1;
    }
}