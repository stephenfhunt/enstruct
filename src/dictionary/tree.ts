import {Comparison, ComparisonResult} from "..";

type BinaryTreeNode = {
    parent: BinaryTreeNode|null;
    left: BinaryTreeNode|null;
    right: BinaryTreeNode|null;
}

export function rotateRight<T extends BinaryTreeNode>(rootNode: T): T {
    const newRoot = rootNode.left;
    if (newRoot === null) return rootNode;

    rootNode.left = newRoot.right;
    if (newRoot.right !== null) {
        newRoot.right.parent = rootNode;
    }

    newRoot.parent = rootNode.parent;
    if (rootNode.parent !== null) {
        if (rootNode.parent.left === rootNode) {
            rootNode.parent.left = newRoot;
        } else {
            rootNode.parent.right = newRoot
        }
    }
    newRoot.right = rootNode; 
    rootNode.parent = newRoot;
    return newRoot as T;
}

export function rotateLeft<T extends BinaryTreeNode>(rootNode: T): T {
    const newRoot = rootNode.right;
    if (newRoot === null) return rootNode;

    rootNode.right = newRoot.left;
    if (newRoot.left !== null) {
        newRoot.left.parent = rootNode;
    }

    newRoot.parent = rootNode.parent;
    if (rootNode.parent !== null) {
        if (rootNode.parent.left === rootNode) {
            rootNode.parent.left = newRoot;
        } else {
            rootNode.parent.right = newRoot
        }
    }
    newRoot.left = rootNode; 
    rootNode.parent = newRoot;
    return newRoot as T;
}

export interface BstNode<K, V> {
    left: BstNode<K, V> | null;
    right: BstNode<K, V> | null;
    readonly key: K;
    value: V;
}

export function bstInsert<K, V>(root: BstNode<K, V>, key: K, value: V, comparison: Comparison<K>): void {
    function newNode(): BstNode<K, V> {
        return {
            left: null,
            right: null,
            key: key,
            value: value
        };
    }

    if (comparison(key, root.key) === ComparisonResult.EQUAL) {
        root.value = value;
    } else if (comparison(key, root.key) === ComparisonResult.LESS) { // to the left
        if (root.left === null) {
            root.left = newNode();
        } else {
            bstInsert(root.left, key, value, comparison);
        }
    } else { // to the right
        if (root.right === null) {
            root.right = newNode();
        } else {
            bstInsert(root.right, key, value, comparison);
        }
    }
}

export function bstSearch<K,V>(root: BstNode<K, V>|null, compare: Comparison<K>, key: K): V|undefined {
    if (root === null) return undefined;

    const comp = compare(key, root.key);
    if (comp === ComparisonResult.EQUAL) {
        return root.value;
    } else if (comp === ComparisonResult.LESS && root.left !== null) {
        return bstSearch(root.left, compare, key);
    } else if (comp === ComparisonResult.GREATER && root.right !== null) {
        return bstSearch(root.right, compare, key);
    }

    return undefined;
}

export function bstCount<K, V>(root: BstNode<K, V>|null): number {
    if (root !== null) {
        return 1 + bstCount(root.left) + bstCount(root.right);
    } else return 0;
}

export function *bstTraverse<K, V>(root: BstNode<K, V>|null): IterableIterator<[K, V]> {
    if (root) {
        yield* bstTraverse(root.left);
        yield [root.key, root.value];
        yield* bstTraverse(root.right);
    }
}
