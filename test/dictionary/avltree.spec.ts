import {AvlTree} from "../../dist/dictionary/avltree";
import {genericDictionary} from "./dictbehavior";

genericDictionary("AVL Tree", (comp, es) => new AvlTree(comp, es));