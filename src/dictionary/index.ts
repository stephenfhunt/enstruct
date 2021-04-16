export type DictEntries<K, V> = Iterable<readonly [K, V]>|readonly (readonly [K, V])[]|null;
export {AvlTree} from "./avltree"