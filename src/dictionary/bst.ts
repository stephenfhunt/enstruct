import {Comparison, ComparisonResult} from "..";

/**
 * utilities useful for binary search trees
 * makes no assumptions about the implementation details regarding 
 * balancing or augmentation of the tree
 */

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

export function bstMin<K, V>(node: BstNode<K,V>|null): BstNode<K, V>|null {
    if (node === null) return null;

    let min = node;
    while (min.left !== null) {
        min = min.left;
    }

    return min;
}

export function bstDelete<K,V>(root: BstNode<K, V>|null, compare: Comparison<K>, key: K): BstNode<K, V>|null {
    if (root === null) return null;

    const comp = compare(key, root.key);
    if (comp === ComparisonResult.LESS && root.left !== null) {
        root.left = bstDelete(root.left, compare, key);
    } else if (comp === ComparisonResult.GREATER && root.right !== null) {
        root.right = bstDelete(root.right, compare, key);
    } else { // EQUAL, so remove and rebalance
        if (root.left === null || root.right === null) {
            let tmp = root.left ?? root.right;
            if (tmp === null) { // no children
                root = null;
            } else {
                root = tmp;
            }
        } else {
            const tmp = bstMin(root.right) ?? null;
            if (tmp)
                tmp.right = bstDelete(root.right, compare, tmp.key);
            root = tmp;
        }
    }

    return root;
}

export function bstSearch<K,V>(root: BstNode<K, V>|null, compare: Comparison<K>, key: K): V|null {
    const node = bstFindNode(root, compare, key);
    return node?.value ?? null;
}

export function bstFindNode<K, V, NodeType extends BstNode<K,V>>(root: NodeType|null, 
                                                                 compare: Comparison<K>, 
                                                                 key: K): NodeType|null {
    if (root === null) return null;

    const comp = compare(key, root.key);
    if (comp === ComparisonResult.EQUAL) {
        return root as NodeType;
    } else if (comp === ComparisonResult.LESS && root.left !== null) {
        return bstFindNode(root.left as NodeType, compare, key);
    } else if (comp === ComparisonResult.GREATER && root.right !== null) {
        return bstFindNode(root.right as NodeType, compare, key);
    }

    return null;

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

export function bstFindReplacement<K, V, NodeType extends BstNode<K, V>>(nodeToRemove: NodeType): NodeType|null {
    let replacement: NodeType|null = null;    
    if (nodeToRemove.right !== null && nodeToRemove.left !== null) {
        replacement = bstMin(nodeToRemove.right) as NodeType|null;
        if (replacement === null) {
            replacement = nodeToRemove.left as NodeType|null;
        }
    } else if (nodeToRemove.left !== null && nodeToRemove.right === null) {
        replacement = nodeToRemove.left as NodeType|null;
    } else if (nodeToRemove.right !== null && nodeToRemove.left === null) {
        replacement = nodeToRemove.right as NodeType|null;
    }

    return replacement;
}