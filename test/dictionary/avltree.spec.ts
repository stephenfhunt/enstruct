import jsc = require("jsverify");
import {AvlTree} from "../../dist/dictionary/avltree";
import {genericDictionary} from "./dictbehavior";
import { defaultCompare } from "../../dist";

describe("AVL Tree", function() {
    genericDictionary("AVL Tree", (comp, es) => new AvlTree(comp, es));

    it("is iterated in comparison order of the keys", function () {
        jsc.assertForall(jsc.array(jsc.tuple([jsc.integer, jsc.string])), (entries: [key: number, value: string][]) => {
            const map = new AvlTree(defaultCompare, entries);

            let good = true;
            let lastKey = Number.MIN_SAFE_INTEGER;

            for (const [key] of map) {
                good &&= key >= lastKey;
                lastKey = key;
            }

            lastKey = Number.MIN_SAFE_INTEGER;
            for (const [key] of map.entries()) {
                good &&= key >= lastKey;
                lastKey = key;
            }

            lastKey = Number.MIN_SAFE_INTEGER;
            for (const key of map.keys()) {
                good &&= key >= lastKey;
                lastKey = key;
            }

            return good;
        });
    });

    it("is always balanced", function() {
        jsc.assertForall(jsc.array(jsc.tuple([jsc.integer, jsc.string])), (entries: [key: number, value: string][]) => {
            const map = new AvlTree(defaultCompare, entries);
            let good = map.balanced;

            for (let [k] of entries) {
                map.delete(k);
                good &&= map.balanced;
            }

            return good;
        });
    });

});